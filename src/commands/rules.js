import { AttachmentBuilder, EmbedBuilder, PermissionsBitField } from "discord.js";
import fs from "node:fs";
import { saveConfig } from "../config.js";

const BANNER_PATH = "database/banner.jpg";

function buildRulesEmbeds() {
  const header = new EmbedBuilder()
    .setColor(0x0a0e27)
    .setDescription(
      "```ansi\n" +
        "\u001b[1;36m╔═══════════════════════════════════════════════════════╗\n" +
        "\u001b[1;36m║     🏛️  ZERODAY TOOLS MARKETPLACE RULES  🏛️          ║\n" +
        "\u001b[1;36m╚═══════════════════════════════════════════════════════╝\n" +
        "```\n" +
        "**Welcome to ZeroDay Tools Marketplace**\n" +
        "Please read all rules carefully before participating.\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

  const conduct = new EmbedBuilder()
    .setColor(0x5865f2)
    .setAuthor({ name: "📋 GENERAL CONDUCT" })
    .addFields(
      {
        name: "✅ DO",
        value:
          "```diff\n" +
          "+ Treat all members with respect\n" +
          "+ Follow staff instructions\n" +
          "+ Use the correct channels\n" +
          "+ Keep deals transparent in tickets\n" +
          "```",
        inline: true,
      },
      {
        name: "❌ DON'T",
        value:
          "```diff\n" +
          "- Spam or flood channels\n" +
          "- Harass or threaten others\n" +
          "- Advertise without permission\n" +
          "- Share private information\n" +
          "```",
        inline: true,
      }
    )
    .setFooter({ text: "ZeroDay Tools • Section 1/4" });

  const marketplace = new EmbedBuilder()
    .setColor(0x00d9ff)
    .setAuthor({ name: "💰 MARKETPLACE GUIDELINES" })
    .addFields(
      {
        name: "🎫 Purchasing Process",
        value:
          "```yaml\n" +
          "Step 1: Browse the catalog\n" +
          "Step 2: Open a ticket\n" +
          "Step 3: Confirm product details\n" +
          "Step 4: Complete payment\n" +
          "Step 5: Receive delivery and support\n" +
          "```",
        inline: false,
      },
      {
        name: "💳 Accepted Payments",
        value:
          "• Cryptocurrency\n" +
          "• PayPal\n" +
          "• Bank transfer\n" +
          "• Other staff-approved methods",
        inline: true,
      },
      {
        name: "🔄 Refund Policy",
        value:
          "• Accepted for non-delivery or clear defects\n" +
          "• Not accepted for misuse or buyer remorse\n" +
          "• Open a ticket within 48 hours",
        inline: true,
      }
    )
    .setFooter({ text: "ZeroDay Tools • Section 2/4" });

  const legal = new EmbedBuilder()
    .setColor(0xff0000)
    .setAuthor({ name: "🛡️ LEGAL COMPLIANCE" })
    .setDescription(
      "```ansi\n" +
        "\u001b[1;31m⚠️  UNAUTHORIZED USE OF SECURITY TOOLS IS ILLEGAL  ⚠️\n" +
        "```\n" +
        "You are responsible for using purchased tools legally and with proper authorization."
    )
    .addFields({
      name: "Consequences of Misuse",
      value:
        "• Permanent ban\n" +
        "• License revocation\n" +
        "• No refunds\n" +
        "• Escalation if required",
      inline: false,
    })
    .setFooter({ text: "ZeroDay Tools • Section 3/4" });

  const prohibited = new EmbedBuilder()
    .setColor(0x8b0000)
    .setAuthor({ name: "🚫 PROHIBITED ACTIVITIES" })
    .addFields(
      { name: "❌ Sharing or reselling products", value: "Permanent ban", inline: true },
      { name: "❌ Scamming or chargebacks", value: "Permanent ban", inline: true },
      { name: "❌ Doxxing or threats", value: "Permanent ban", inline: true },
      { name: "❌ Impersonating staff", value: "Permanent ban", inline: true }
    )
    .setFooter({ text: "ZeroDay Tools • Section 4/4" });

  return { header, conduct, marketplace, legal, prohibited };
}

export const command = {
  name: "postrules",
  aliases: ["serverrules"],
  async execute({ message, args, config, cmd }) {
    if (cmd === "serverrules") {
      const ownerId = process.env.OWNER_ID || config.owner_id;
      if (ownerId && message.author.id !== String(ownerId)) {
        await message.channel.send("```\n❌ This command is owner-only.\n```");
        return;
      }

      const rulesEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("📜 SERVER RULES & GUIDELINES")
        .setDescription("Welcome to our community! To ensure a safe and pleasant environment for everyone, please follow these rules:")
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addFields(
          { 
            name: "⊱・ Respect Everyone ・⊰", 
            value: "Any type of discrimination against religion, race, culture, sex or sexuality is strictly forbidden. This server welcomes everyone! If anyone is secretly offending you or shading you from the server, then report it to the moderators or co-owner. We will try everything in our power to help you out.",
            inline: false 
          },
          { 
            name: "⊱・ No NSFW ・⊰", 
            value: "NSFW content in the server is not allowed as it can make people uncomfortable. Respect all ages. Anything containing slurs or gore is also not allowed. If it's a minor gore, then put a TW/spoiler on it.",
            inline: false 
          },
          { 
            name: "⊱・ Avoid Drama ・⊰", 
            value: "Try your very best not to talk about controversial topics in the server, drama outside the server should stay outside. Keep the server healthy for everyone. Hate speech or death threats against anyone will not be tolerated.",
            inline: false 
          },
          { 
            name: "⊱・ No Sharing Of Personal Information ・⊰", 
            value: "Your address, phone numbers, or anything else that could be considered highly personal. You are responsible for your own safety.",
            inline: false 
          },
          { 
            name: "⊱・ No Spamming ・⊰", 
            value: "No spam ping or spamming of emotes or messages is allowed, it can be very annoying to some people.",
            inline: false 
          },
          { 
            name: "⊱・ Swearing is allowed but at a minimum ・⊰", 
            value: "There's a limit to everything, keep your cussing at a minimum as much as possible, no swearing towards a member is allowed.",
            inline: false 
          },
          { 
            name: "⊱・ Use Channels as directed ・⊰", 
            value: "Do not misuse the channels please, use all channels correctly.",
            inline: false 
          },
          { 
            name: "⊱・ No Server Invite Links ・⊰", 
            value: "Server promotion is not allowed, if someone in the server is promoting their server in DMs then let us know.",
            inline: false 
          }
        )
        .setFooter({ text: "We take criticism very seriously. You can suggest rules by DMing us.", iconURL: message.guild.iconURL() })
        .setTimestamp();

      await message.channel.send({ embeds: [rulesEmbed] });
      return;
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.channel.send("```\n❌ You need Administrator permission.\n```");
      return;
    }

    const targetChannel = message.mentions.channels.first()
      ?? (config.rules_channel ? message.guild.channels.cache.get(String(config.rules_channel)) : null)
      ?? message.channel;

    if (!targetChannel?.isTextBased()) {
      await message.channel.send("```\n❌ Rules channel not found.\n```");
      return;
    }

    await targetChannel.bulkDelete(100, true).catch(() => {});
    const { header, conduct, marketplace, legal, prohibited } = buildRulesEmbeds();
    const payload = fs.existsSync(BANNER_PATH)
      ? {
          embeds: [header.setImage("attachment://banner.jpg")],
          files: [new AttachmentBuilder(BANNER_PATH, { name: "banner.jpg" })],
        }
      : { embeds: [header] };

    const first = await targetChannel.send(payload);
    await targetChannel.send({ embeds: [conduct] });
    await targetChannel.send({ embeds: [marketplace] });
    await targetChannel.send({ embeds: [legal] });
    await targetChannel.send({ embeds: [prohibited] });

    config.rules_channel = targetChannel.id;
    config.rules_message_id = first.id;
    saveConfig(config);

    await message.channel.send(`✅ Rules posted in ${targetChannel}`);
  },
};
