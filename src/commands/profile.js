import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

function toHexColor(value) {
  if (!value) return 0x3498db;
  if (typeof value === "number") return value;
  return Number(`0x${String(value).replace("#", "")}`);
}

function statusLabel(member) {
  const status = member?.presence?.status ?? "offline";
  const map = {
    online: "🟢 Online",
    idle: "🟡 Idle",
    dnd: "🔴 Do Not Disturb",
    offline: "⚫ Offline",
    invisible: "⚫ Offline",
  };
  return map[status] ?? "⚫ Offline";
}

async function resolveTarget(message) {
  const member = message.mentions.members.first()
    ?? (message.content.match(/\d{16,20}/)?.[0]
      ? await message.guild.members.fetch(message.content.match(/\d{16,20}/)[0]).catch(() => null)
      : message.member);
  const user = member?.user
    ?? message.mentions.users.first()
    ?? message.author;
  const fetchedUser = await message.client.users.fetch(user.id, { force: true }).catch(() => user);
  return { member: member ?? null, user, fetchedUser };
}

export const command = {
  name: "banner",
  aliases: ["userbanner", "ub", "userinfo", "ui", "whois", "user", "memberinfo"],
  async execute({ message, config }) {
    const cmd = message.content.split(/\s+/)[0].replace(config.prefix, "").toLowerCase();
    const { member, user, fetchedUser } = await resolveTarget(message);

    if (cmd === "banner" || cmd === "userbanner" || cmd === "ub") {
      if (!fetchedUser.banner) {
        await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xff0000)
              .setTitle("❌ No Banner")
              .setDescription(`${user} does not have a profile banner set.`)
              .setThumbnail(user.displayAvatarURL()),
          ],
        });
        return;
      }

      const bannerPng = fetchedUser.bannerURL({ extension: "png", size: 4096 });
      const bannerJpg = fetchedUser.bannerURL({ extension: "jpg", size: 4096 });
      const bannerWebp = fetchedUser.bannerURL({ extension: "webp", size: 4096 });
      const bannerGif = fetchedUser.bannerURL({ extension: "gif", size: 4096 });
      const animated = Boolean(fetchedUser.banner?.startsWith?.("a_"));

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("PNG").setStyle(ButtonStyle.Link).setURL(bannerPng),
        new ButtonBuilder().setLabel("JPG").setStyle(ButtonStyle.Link).setURL(bannerJpg),
        new ButtonBuilder().setLabel("WEBP").setStyle(ButtonStyle.Link).setURL(bannerWebp),
        ...(animated && bannerGif
          ? [new ButtonBuilder().setLabel("GIF").setStyle(ButtonStyle.Link).setURL(bannerGif)]
          : [])
      );

      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(toHexColor(fetchedUser.accentColor ?? member?.displayHexColor ?? "#3498db"))
            .setTimestamp(new Date())
            .setAuthor({ name: `${user.username}'s Banner`, iconURL: user.displayAvatarURL() })
            .setImage(fetchedUser.bannerURL({ size: 4096 }))
            .addFields(
              {
                name: "👤 User Details",
                value:
                  "```yaml\n" +
                  `Username     : ${user.username}\n` +
                  `Display Name : ${member?.displayName ?? user.displayName ?? user.username}\n` +
                  `User ID      : ${user.id}\n` +
                  `Animated     : ${animated ? "Yes" : "No"}\n` +
                  "```",
                inline: false,
              },
              {
                name: "🔗 Download Links",
                value: `[PNG](${bannerPng}) • [JPG](${bannerJpg}) • [WEBP](${bannerWebp})${animated && bannerGif ? ` • [GIF](${bannerGif})` : ""}`,
                inline: false,
              }
            ),
        ],
        components: [buttons],
      });
      return;
    }

    const targetMember = member ?? await message.guild.members.fetch(user.id).catch(() => null);
    const createdTs = Math.floor(user.createdTimestamp / 1000);
    const joinedTs = targetMember?.joinedTimestamp ? Math.floor(targetMember.joinedTimestamp / 1000) : null;
    const roles = targetMember?.roles?.cache?.filter((role) => role.id !== message.guild.roles.everyone.id).sort((a, b) => b.position - a.position) ?? [];
    const membersSorted = message.guild.members.cache
      .filter((entry) => entry.joinedTimestamp)
      .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    const joinPosition = targetMember ? membersSorted.findIndex((entry) => entry.id === targetMember.id) + 1 : 0;
    const importantPerms = targetMember
      ? [
          ["Administrator", targetMember.permissions.has("Administrator")],
          ["Manage Server", targetMember.permissions.has("ManageGuild")],
          ["Manage Roles", targetMember.permissions.has("ManageRoles")],
          ["Manage Channels", targetMember.permissions.has("ManageChannels")],
          ["Kick Members", targetMember.permissions.has("KickMembers")],
          ["Ban Members", targetMember.permissions.has("BanMembers")],
        ].filter(([, has]) => has).map(([name]) => name)
      : [];

    const badges = [];
    if (fetchedUser.banner) badges.push("💎 Nitro");
    if (targetMember?.premiumSinceTimestamp) badges.push("💖 Server Booster");
    if (user.bot) badges.push("🤖 Bot");

    await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(toHexColor(targetMember?.displayHexColor ?? fetchedUser.accentColor ?? "#3498db"))
          .setTimestamp(new Date())
          .setAuthor({ name: `${user.username}'s Information`, iconURL: user.displayAvatarURL() })
          .setThumbnail(user.displayAvatarURL())
          .addFields(
            {
              name: "📋 Basic Information",
              value:
                "```yaml\n" +
                `Username     : ${user.username}\n` +
                `Display Name : ${targetMember?.displayName ?? user.displayName ?? user.username}\n` +
                `User ID      : ${user.id}\n` +
                `Bot Account  : ${user.bot ? "Yes ✅" : "No ❌"}\n` +
                `Status       : ${statusLabel(targetMember)}\n` +
                "```",
              inline: false,
            },
            {
              name: "📅 Account Information",
              value: `**Created:** <t:${createdTs}:F>\n**Relative:** <t:${createdTs}:R>`,
              inline: true,
            },
            {
              name: "🏰 Server Information",
              value: joinedTs
                ? `**Joined:** <t:${joinedTs}:F>\n**Relative:** <t:${joinedTs}:R>\n**Join Position:** \`#${joinPosition}\``
                : "Not available",
              inline: true,
            },
            {
              name: `🎖️ Badges (${badges.length})`,
              value: badges.length ? badges.join(" ") : "None",
              inline: false,
            },
            {
              name: `🎭 Roles (${roles.size ?? roles.length})`,
              value: roles.size || roles.length
                ? roles.map((role) => role.toString()).slice(0, 15).join(" ") + ((roles.size ?? roles.length) > 15 ? ` **+${(roles.size ?? roles.length) - 15} more**` : "")
                : "No roles",
              inline: false,
            },
            {
              name: "🛡️ Key Permissions",
              value: importantPerms.length ? importantPerms.join(", ") : "No elevated permissions",
              inline: false,
            }
          ),
      ],
    });
  },
};
