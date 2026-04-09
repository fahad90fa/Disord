import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import QRCode from "qrcode";
import crypto from "node:crypto";
import {
  getAfkData,
  getReminders,
  saveAfkData,
  saveReminders,
} from "../state.js";

const deletedMessages = new Map();
const editedMessages = new Map();

function parseTime(raw) {
  const match = /^(\d+)([smhdw])$/i.exec(raw || "");
  if (!match) return null;
  const units = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  return Number(match[1]) * units[match[2].toLowerCase()];
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}

async function processReminders(client) {
  const reminders = getReminders();
  let changed = false;
  for (const [userId, items] of Object.entries(reminders)) {
    for (const reminder of [...items]) {
      if (Date.now() >= new Date(reminder.remind_at).getTime()) {
        const user = await client.users.fetch(userId).catch(() => null);
        const channel = await client.channels.fetch(reminder.channel_id).catch(() => null);
        const text = `⏰ Reminder: ${reminder.message}`;
        if (channel?.isTextBased()) {
          await channel.send(`<@${userId}> ${text}`).catch(() => {});
        } else if (user) {
          await user.send(text).catch(() => {});
        }
        items.splice(items.indexOf(reminder), 1);
        changed = true;
      }
    }
  }
  if (changed) saveReminders(reminders);
}

export const command = {
  name: "remind",
  aliases: [
    "reminder",
    "remindme",
    "calculate",
    "calc",
    "math",
    "qrcode",
    "qr",
    "password",
    "genpass",
    "passgen",
    "snipe",
    "editsnipe",
    "afk",
    "av",
    "avatar",
    "pfp",
    "profilepic",
    "hash",
  ],
  async execute({ message, args, config }) {
    const cmd = message.content.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase();

    if (cmd === "remind" || cmd === "reminder" || cmd === "remindme") {
      const duration = parseTime(args[0]);
      const reminderMessage = args.slice(1).join(" ");
      if (!duration || !reminderMessage) {
        await message.channel.send("```\n❌ Usage: !remind <1d|2h|30m> <message>\n```");
        return;
      }
      const reminders = getReminders();
      const key = String(message.author.id);
      if (!reminders[key]) reminders[key] = [];
      reminders[key].push({
        id: reminders[key].length + 1,
        message: reminderMessage,
        channel_id: message.channel.id,
        remind_at: new Date(Date.now() + duration * 1000).toISOString(),
        created_at: new Date().toISOString(),
      });
      saveReminders(reminders);
      await message.channel.send(`\`\`\`\n⏰ Reminder set!\nI'll remind you in ${args[0]}\nMessage: ${reminderMessage.slice(0, 50)}...\n\`\`\``);
      return;
    }

    if (cmd === "calculate" || cmd === "calc" || cmd === "math") {
      const expression = args.join(" ");
      if (!expression || !/^[\d+\-*/().^ ]+$/.test(expression.replace(/\*\*/g, "^"))) {
        await message.channel.send("```\n❌ Invalid characters in expression!\n```");
        return;
      }
      try {
        const normalized = expression.replace(/\^/g, "**");
        const result = Function(`"use strict"; return (${normalized})`)();
        await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🧮 Calculator").setColor(0x3498db).addFields(
          { name: "Expression", value: `\`\`\`${normalized}\`\`\``, inline: false },
          { name: "Result", value: `\`\`\`${result}\`\`\``, inline: false },
        )] });
      } catch (error) {
        await message.channel.send(`\`\`\`\n❌ Error: ${error.message}\n\`\`\``);
      }
      return;
    }

    if (cmd === "qrcode" || cmd === "qr") {
      const text = args.join(" ");
      if (!text) {
        await message.channel.send("```\n❌ Usage: !qrcode <text>\n```");
        return;
      }
      const buffer = await QRCode.toBuffer(text);
      const attachment = new AttachmentBuilder(buffer, { name: "qrcode.png" });
      await message.channel.send({
        embeds: [new EmbedBuilder().setTitle("📱 QR Code Generated").setColor(0x3498db).setImage("attachment://qrcode.png").setFooter({ text: `Data: ${text.slice(0, 100)}...` })],
        files: [attachment],
      });
      return;
    }

    if (cmd === "password" || cmd === "genpass" || cmd === "passgen") {
      const length = Number(args[0] || 16);
      if (length < 8 || length > 64) {
        await message.channel.send("```\n❌ Length must be between 8 and 64!\n```");
        return;
      }
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>?";
      const password = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      await message.author.send("```\n🔐 Generated Password\n━━━━━━━━━━━━━━━━━━━━\n" + password + `\n━━━━━━━━━━━━━━━━━━━━\nLength: ${length} characters\n\`\`\``).catch(async () => {
        await message.channel.send("```\n❌ Enable DMs to receive password!\n```");
      });
      if (message.channel) await message.channel.send("✅ Password sent to your DMs!").catch(() => {});
      return;
    }

    if (cmd === "hash") {
      const type = (args[0] || "").toLowerCase();
      const text = args.slice(1).join(" ");
      if (!["md5", "sha1", "sha256", "sha512"].includes(type) || !text) {
        await message.channel.send("```\n❌ Usage: !hash <md5|sha1|sha256|sha512> <text>\n```");
        return;
      }
      const digest = crypto.createHash(type).update(text).digest("hex");
      await message.channel.send(`\`\`\`\n${digest}\n\`\`\``);
      return;
    }

    if (cmd === "snipe" || cmd === "editsnipe") {
      const data = cmd === "snipe" ? deletedMessages.get(message.channel.id) : editedMessages.get(message.channel.id);
      if (!data) {
        await message.channel.send(`\`\`\`\n❌ No recently ${cmd === "snipe" ? "deleted" : "edited"} messages!\n\`\`\``);
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(cmd === "snipe" ? "🎯 Message Sniped" : "✏️ Edit Sniped")
        .setColor(cmd === "snipe" ? 0xe74c3c : 0xf1c40f)
        .setTimestamp(new Date(data.timestamp))
        .setAuthor({ name: data.authorName, iconURL: data.authorAvatar });
      if (cmd === "snipe") {
        embed.setDescription(data.content || "*No content*");
      } else {
        embed.addFields(
          { name: "Before", value: data.before || "*No content*", inline: false },
          { name: "After", value: data.after || "*No content*", inline: false }
        );
      }
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "afk") {
      const reason = args.join(" ") || "AFK";
      const afkData = getAfkData();
      afkData[String(message.author.id)] = { reason: reason.slice(0, 100), time: new Date().toISOString() };
      saveAfkData(afkData);
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("😴 AFK Status Set").setColor(0xffa500).setTimestamp(new Date()).setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() }).addFields(
        { name: "Reason", value: `\`\`\`${reason}\`\`\``, inline: false },
        { name: "Started", value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        { name: "User", value: `${message.author}`, inline: true },
      )] });
      if (!message.member.displayName.startsWith("[AFK]")) {
        await message.member.setNickname(`[AFK] ${message.member.displayName}`.slice(0, 32)).catch(() => {});
      }
      return;
    }

    if (cmd === "av" || cmd === "avatar" || cmd === "pfp" || cmd === "profilepic") {
      const target = message.mentions.members.first() ?? message.member;
      const avatar = target.displayAvatarURL({ extension: "png", size: 4096 });
      const webp = target.displayAvatarURL({ extension: "webp", size: 4096 });
      const jpg = target.displayAvatarURL({ extension: "jpg", size: 4096 });
      const gif = target.displayAvatarURL({ extension: "gif", size: 4096, forceStatic: false });
      const isAnimated = target.user.avatar?.startsWith("a_") ?? false;
      const embed = new EmbedBuilder()
        .setColor(target.displayHexColor === "#000000" ? 0x00ff9d : Number(`0x${target.displayHexColor.slice(1)}`))
        .setTimestamp(new Date())
        .setAuthor({ name: `${target.user.username}'s Avatar`, iconURL: target.displayAvatarURL() })
        .setImage(target.displayAvatarURL({ size: 4096 }))
        .addFields(
          { name: "👤 User Information", value: `\`\`\`yaml\nUsername    : ${target.user.username}\nDisplay Name: ${target.displayName}\nUser ID     : ${target.id}\nBot Account : ${target.user.bot ? "Yes" : "No"}\nAnimated    : ${isAnimated ? "Yes" : "No"}\n\`\`\``, inline: false },
          { name: "🔗 Download Links", value: `[PNG](${avatar}) • [JPG](${jpg}) • [WEBP](${webp})${isAnimated ? ` • [GIF](${gif})` : ""}`, inline: false }
        )
        .setFooter({ text: `Requested by ${message.author.username} • ZeroDay Tool`, iconURL: message.author.displayAvatarURL() });
      await message.channel.send({ embeds: [embed] });
    }
  },
};

export async function register(client, config) {
  if (!client.utilityReminderInterval) {
    client.utilityReminderInterval = setInterval(() => {
      processReminders(client).catch(() => {});
    }, 15000);
  }

  if (!client.utilityListenersReady) {
    client.utilityListenersReady = true;

    client.on("messageDelete", (message) => {
      if (!message.author?.bot) {
        deletedMessages.set(message.channel.id, {
          content: message.content,
          authorName: message.author.username,
          authorAvatar: message.author.displayAvatarURL(),
          timestamp: new Date().toISOString(),
        });
      }
    });

    client.on("messageUpdate", (before, after) => {
      if (!before || !after) return;
      if (!before.author || !after.author) return;
      if (before.author.bot) return;
      if (before.content === after.content) return;

      if (!before.channel?.id) return;
      const authorName = before.author.username || "Unknown User";
      const authorAvatar = before.author.displayAvatarURL?.() || null;

        editedMessages.set(before.channel.id, {
          before: before.content,
          after: after.content,
          authorName,
          authorAvatar,
          timestamp: new Date().toISOString(),
        });
    });

    client.on("messageCreate", async (message) => {
      if (!message.guild || message.author.bot) return;
      const afkData = getAfkData();
      const userKey = String(message.author.id);

      if (afkData[userKey] && !message.content.startsWith(`${config.prefix}afk`)) {
        const info = afkData[userKey];
        const duration = formatDuration((Date.now() - new Date(info.time).getTime()) / 1000);
        delete afkData[userKey];
        saveAfkData(afkData);
        await message.channel.send({ embeds: [new EmbedBuilder().setTitle("👋 Welcome Back!").setDescription(`${message.author} is no longer AFK`).setColor(0x00ff00).addFields(
          { name: "⏱️ AFK Duration", value: `\`\`\`${duration}\`\`\``, inline: true },
          { name: "📝 Reason", value: `\`\`\`${info.reason}\`\`\``, inline: true }
        ).setFooter({ text: "AFK status removed automatically" })] }).catch(() => {});
        if (message.member.displayName.startsWith("[AFK] ")) {
          await message.member.setNickname(message.member.displayName.replace("[AFK] ", "") || null).catch(() => {});
        }
      }

      for (const mentioned of message.mentions.users.values()) {
        const info = afkData[String(mentioned.id)];
        if (!info) continue;
        const duration = formatDuration((Date.now() - new Date(info.time).getTime()) / 1000);
        await message.channel.send({ embeds: [new EmbedBuilder().setTitle("💤 User is AFK").setDescription(`<@${mentioned.id}> is currently AFK`).setColor(0xffa500).addFields(
          { name: "📝 Reason", value: `\`\`\`${info.reason}\`\`\``, inline: false },
          { name: "⏰ Duration", value: `\`\`\`${duration}\`\`\``, inline: true },
          { name: "🕐 Since", value: `<t:${Math.floor(new Date(info.time).getTime() / 1000)}:R>`, inline: true }
        ).setFooter({ text: "They will be notified when they return" })] }).catch(() => {});
      }
    });
  }
}
