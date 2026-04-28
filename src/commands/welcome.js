import { EmbedBuilder, PermissionsBitField } from "discord.js";
import { saveConfig } from "../config.js";

const VALID_STYLES = ["main", "compact", "hacker", "matrix", "minimal", "cyberpunk", "line"];
const AUTO_JOIN_ROLE_ID = "1490998019603042496";

function resolveWelcomeStyle(style) {
  if (!style || style === "line") return "main";
  return VALID_STYLES.includes(style) ? style : "main";
}

function buildWelcomeEmbed(member, style, isTest = false) {
  const colorMap = {
    main: 0x00ff9d,
    compact: 0x5865f2,
    hacker: 0x00ff00,
    matrix: 0x145a32,
    minimal: 0x95a5a6,
    cyberpunk: 0xff2d55,
  };
  const titleMap = {
    main: `🎉 Welcome to ${member.guild.name}`,
    compact: "👋 Welcome",
    hacker: "💻 Access Granted",
    matrix: "🟢 Connection Established",
    minimal: "Welcome Aboard",
    cyberpunk: "🌃 New Signal Detected",
  };
  const descMap = {
    main:
      `${member} just joined the server.\n` +
      `You are member **#${member.guild.memberCount}**. Read the rules and enjoy your stay.`,
    compact: `${member} joined the server. Make yourself at home.`,
    hacker:
      "```ansi\n" +
      "\u001b[1;32m[ SYSTEM ] New user authenticated successfully.\n" +
      "```\n" +
      `${member} is now inside the network.`,
    matrix:
      "```ansi\n" +
      "\u001b[1;32mWake up, Neo...\n" +
      "\u001b[1;32mThe Matrix has a new resident.\n" +
      "```\n" +
      `${member} entered the simulation.`,
    minimal: `${member} joined. Welcome.`,
    cyberpunk:
      "```ansi\n" +
      "\u001b[1;35mNight City traffic spiked for a moment.\n" +
      "```\n" +
      `${member} plugged into the grid.`,
  };

  return new EmbedBuilder()
    .setColor(colorMap[style] ?? 0x00ff9d)
    .setTitle(titleMap[style] ?? titleMap.main)
    .setDescription(descMap[style] ?? descMap.main)
    .setThumbnail(member.displayAvatarURL())
    .addFields(
      { name: "User", value: `${member.user.tag}`, inline: true },
      { name: "Joined As", value: `#${member.guild.memberCount}`, inline: true },
      { name: "Mode", value: isTest ? "Test Preview" : style.toUpperCase(), inline: true }
    )
    .setFooter({ text: `${member.guild.name} Welcome System` })
    .setTimestamp(new Date());
}

async function sendWelcome(channel, member, style, isTest = false) {
  await channel.send({ embeds: [buildWelcomeEmbed(member, style, isTest)] });
}

export const command = {
  name: "welcome",
  aliases: ["testwelcome", "disablewelcome", "welcomestats", "setwelcomestyle"],
  async execute({ message, args, config }) {
    const cmd = message.content.split(/\s+/)[0].replace(config.prefix, "").toLowerCase();
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.channel.send("```\n❌ You need Administrator permission.\n```");
      return;
    }

    if (cmd === "welcome") {
      const channel = message.mentions.channels.first();
      if (!channel?.isTextBased()) {
        await message.channel.send("```\n❌ Usage: !welcome #channel\n```");
        return;
      }
      config.welcome_channel = channel.id;
      config.welcome_style = resolveWelcomeStyle(config.welcome_style);
      saveConfig(config);
      await message.channel.send(`✅ Welcome channel set to ${channel}`);
      await channel.send("```\n🎉 Welcome system configured successfully.\n```").catch(() => {});
      return;
    }

    if (cmd === "testwelcome") {
      const channel = config.welcome_channel ? message.guild.channels.cache.get(String(config.welcome_channel)) : null;
      if (!channel?.isTextBased()) {
        await message.channel.send("```\n❌ Welcome channel not set. Use !welcome #channel first.\n```");
        return;
      }
      await sendWelcome(channel, message.member, resolveWelcomeStyle(config.welcome_style), true);
      await message.channel.send(`✅ Test welcome message sent to ${channel}`);
      return;
    }

    if (cmd === "disablewelcome") {
      config.welcome_channel = null;
      saveConfig(config);
      await message.channel.send("```\n🔴 Welcome system disabled.\n```");
      return;
    }

    if (cmd === "welcomestats") {
      const channel = config.welcome_channel ? message.guild.channels.cache.get(String(config.welcome_channel)) : null;
      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle("📊 Welcome System Statistics")
            .addFields(
              { name: "Status", value: config.welcome_channel ? "✅ ENABLED" : "❌ DISABLED", inline: true },
              { name: "Channel", value: channel ? `${channel}` : "Not configured", inline: true },
              { name: "Style", value: resolveWelcomeStyle(config.welcome_style).toUpperCase(), inline: true },
              { name: "Members", value: `${message.guild.memberCount}`, inline: true }
            ),
        ],
      });
      return;
    }

    if (cmd === "setwelcomestyle") {
      const style = (args[0] || "").toLowerCase();
      if (!VALID_STYLES.includes(style)) {
        await message.channel.send(
          "```\n❌ Usage: !setwelcomestyle <main|compact|hacker|matrix|minimal|cyberpunk>\n```"
        );
        return;
      }
      config.welcome_style = resolveWelcomeStyle(style);
      saveConfig(config);
      await message.channel.send(`✅ Welcome style changed to **${config.welcome_style.toUpperCase()}**`);
    }
  },
};

export async function register(client, config) {
  if (client.welcomeListenerReady) return;
  client.welcomeListenerReady = true;

  client.on("guildMemberAdd", async (member) => {
    if (member.user.bot) return;

    const autoRole = member.guild.roles.cache.get(AUTO_JOIN_ROLE_ID);
    if (autoRole) {
      await member.roles.add(autoRole).catch(() => {});
    }

    if (!config.welcome_channel) return;
    const channel = member.guild.channels.cache.get(String(config.welcome_channel));
    if (!channel?.isTextBased()) return;
    await sendWelcome(channel, member, resolveWelcomeStyle(config.welcome_style));
  });
}
