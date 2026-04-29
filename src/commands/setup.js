import {
  ChannelType,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import { saveConfig } from "../config.js";

function buildStorefrontEmbed(config) {
  return new EmbedBuilder()
    .setColor(Number(config.embed_color))
    .setTimestamp(new Date())
    .setAuthor({ name: "🛒 ZeroDay Tools Storefront" })
    .setDescription(
      "**Welcome to the premium storefront.**\n" +
        "Use the commands below to browse products, buy items, and open support tickets.\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    )
    .addFields(
      {
        name: "Browsing",
        value:
          "`!products`\n`!product <id>`\n`!buy <id>`\n`!orders`\n`!order <id>`",
        inline: true,
      },
      {
        name: "Support",
        value:
          "`!ticket <reason>`\n`!closeticket`\n`!mytickets`\n`!help`",
        inline: true,
      }
    )
    .setFooter({ text: "ZeroDay Tools • Storefront is live" });
}

async function ensureCategory(guild, name) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) return existing;
  return guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
    ],
  });
}

async function ensureTextChannel(guild, name, parent = null) {
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && channel.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) return existing;
  return guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: parent?.id ?? null,
  });
}

function resolveChannel(message) {
  return message.mentions.channels.first()
    ?? message.guild.channels.cache.get(message.content.match(/\d{16,20}/)?.[0] ?? "")
    ?? null;
}

export const command = {
  name: "setup",
  aliases: ["setchannel"],
  async execute({ message, args, config, cmd }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.channel.send("```\n❌ You need Administrator permission.\n```");
      return;
    }

    if (cmd === "setup") {
      const ownerId = process.env.OWNER_ID || config.owner_id;
      if (ownerId && message.author.id !== String(ownerId)) {
        await message.channel.send("```\n❌ This command is owner-only.\n```");
        return;
      }

      const salesChannel = resolveChannel(message);
      if (!salesChannel || salesChannel.type !== ChannelType.GuildText) {
        await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x5865f2)
              .setTitle("⚙️ Setup Wizard")
              .setDescription(
                "**Configure your premium storefront**\n\n" +
                  `\`${config.prefix}setup #sales-channel\`\n\n` +
                  "This will:\n" +
                  "• Set the sales channel\n" +
                  "• Create a Tickets category if needed\n" +
                  "• Create a bot log channel if needed\n" +
                  "• Save the config and deploy a storefront embed"
              ),
          ],
        });
        return;
      }

      const ticketCategory = await ensureCategory(message.guild, "Tickets");
      const logChannel = await ensureTextChannel(message.guild, "bot-logs");

      config.sales_channel = salesChannel.id;
      config.ticket_category = ticketCategory.id;
      config.log_channel = logChannel.id;
      config.admin_roles = message.member.roles.cache
        .filter((role) => role.id !== message.guild.roles.everyone.id)
        .map((role) => role.id);
      saveConfig(config);

      await salesChannel.send({ embeds: [buildStorefrontEmbed(config)] }).catch(() => {});

      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle("✅ Storefront Deployed Successfully")
            .setDescription("Your premium marketplace is now live.")
            .addFields(
              { name: "📢 Sales Channel", value: `${salesChannel}`, inline: false },
              { name: "🎫 Ticket Category", value: `${ticketCategory.name}`, inline: true },
              { name: "📝 Log Channel", value: `${logChannel}`, inline: true }
            ),
        ],
      });
      return;
    }

    if (cmd === "setchannel") {
      const type = (args[0] || "").toLowerCase();
      const channel = resolveChannel(message);
      if (!type || !channel) {
        await message.channel.send("```\n❌ Usage: !setchannel <sales|logs|welcome|rules> #channel\n```");
        return;
      }
      if (type === "sales") config.sales_channel = channel.id;
      else if (type === "logs") config.log_channel = channel.id;
      else if (type === "welcome") config.welcome_channel = channel.id;
      else if (type === "rules") config.rules_channel = channel.id;
      else {
        await message.channel.send("```\n❌ Invalid channel type. Use sales, logs, welcome, or rules.\n```");
        return;
      }
      saveConfig(config);
      await message.channel.send(`✅ ${type} channel set to ${channel}`);
    }
  },
};
