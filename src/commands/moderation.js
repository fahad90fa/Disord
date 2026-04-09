import { EmbedBuilder, PermissionsBitField } from "discord.js";
import { addModCase, getModCases, getWarnings, saveModCases, saveWarnings, addWarning } from "../state.js";

function parseDuration(raw) {
  const match = /^(\d+)([smhd])$/i.exec(raw || "");
  if (!match) return null;
  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  return Number(match[1]) * units[match[2].toLowerCase()];
}

function canActOn(member, actor) {
  return member && actor && member.id !== actor.id && member.roles.highest.comparePositionTo(actor.roles.highest) < 0;
}

export const command = {
  name: "kick",
  aliases: [
    "ban",
    "unban",
    "softban",
    "mute",
    "timeout",
    "unmute",
    "untimeout",
    "warn",
    "warnings",
    "warns",
    "clearwarns",
    "clearwarnings",
    "purge",
    "clear",
    "clean",
    "purgeuser",
    "purgebots",
    "purgelinks",
    "purgeimages",
    "slowmode",
    "lock",
    "unlock",
    "lockdown",
    "nuke",
    "modlogs",
    "case",
    "editcase",
  ],
  async execute({ message, args, config }) {
    const cmd = message.content.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase();

    if (cmd === "kick") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
        await message.channel.send("```\n❌ You need Kick Members permission.\n```");
        return;
      }
      const member = message.mentions.members.first();
      const reason = args.slice(1).join(" ") || "No reason provided";
      if (!member || !canActOn(member, message.member)) {
        await message.channel.send("```\n❌ Invalid kick target.\n```");
        return;
      }
      await member.send({ embeds: [new EmbedBuilder().setTitle("⚠️ You were kicked").setDescription(`**Server:** ${message.guild.name}\n**Reason:** ${reason}`).setColor(0xe67e22)] }).catch(() => {});
      await member.kick(`Kicked by ${message.author.tag} | ${reason}`);
      const caseEntry = addModCase(message.guild.id, { type: "kick", user_id: member.id, moderator_id: message.author.id, reason });
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("👢 Member Kicked").setColor(0xe67e22).setTimestamp(new Date()).addFields(
        { name: "User", value: `${member}\n\`${member.id}\``, inline: true },
        { name: "Moderator", value: `${message.member}`, inline: true },
        { name: "Reason", value: reason, inline: false },
        { name: "Case ID", value: `#${caseEntry.case_id}`, inline: true },
      )] });
      return;
    }

    if (cmd === "ban") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        await message.channel.send("```\n❌ You need Ban Members permission.\n```");
        return;
      }
      const member = message.mentions.members.first();
      const userId = member?.id || args[0];
      const reason = member ? args.slice(1).join(" ") : args.slice(1).join(" ");
      if (!userId) {
        await message.channel.send("```\n❌ Usage: !ban @user [reason] or !ban <user_id> [reason]\n```");
        return;
      }
      if (member && !canActOn(member, message.member)) {
        await message.channel.send("```\n❌ You can't ban this user!\n```");
        return;
      }
      if (member) {
        await member.send({ embeds: [new EmbedBuilder().setTitle("🔨 You were banned").setDescription(`**Server:** ${message.guild.name}\n**Reason:** ${reason || "No reason provided"}`).setColor(0xe74c3c)] }).catch(() => {});
      }
      await message.guild.members.ban(userId, { reason: `Banned by ${message.author.tag} | ${reason || "No reason provided"}` });
      const caseEntry = addModCase(message.guild.id, { type: "ban", user_id: userId, moderator_id: message.author.id, reason: reason || "No reason provided" });
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🔨 Member Banned").setColor(0xe74c3c).setTimestamp(new Date()).addFields(
        { name: "User ID", value: `\`${userId}\``, inline: true },
        { name: "Moderator", value: `${message.member}`, inline: true },
        { name: "Reason", value: reason || "No reason provided", inline: false },
        { name: "Case ID", value: `#${caseEntry.case_id}`, inline: true },
      )] });
      return;
    }

    if (cmd === "unban") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        await message.channel.send("```\n❌ You need Ban Members permission.\n```");
        return;
      }
      const userId = args[0];
      if (!userId) {
        await message.channel.send("```\n❌ Usage: !unban <user_id>\n```");
        return;
      }
      await message.guild.members.unban(userId, `Unbanned by ${message.author.tag}`).catch(async () => {
        await message.channel.send("```\n❌ User not found in ban list!\n```");
      });
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("✅ User Unbanned").setDescription(`User ID \`${userId}\` has been unbanned.`).setColor(0x2ecc71)] });
      return;
    }

    if (cmd === "softban") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        await message.channel.send("```\n❌ You need Ban Members permission.\n```");
        return;
      }
      const member = message.mentions.members.first();
      const reason = args.slice(1).join(" ") || "No reason";
      if (!member || !canActOn(member, message.member)) {
        await message.channel.send("```\n❌ Invalid softban target.\n```");
        return;
      }
      await message.guild.members.ban(member, { reason: `Softban by ${message.author.tag} | ${reason}`, deleteMessageSeconds: 7 * 24 * 60 * 60 }).catch(async () => {
        await message.channel.send("```\n❌ Softban failed.\n```");
      });
      await message.guild.members.unban(member.id, "Softban complete").catch(() => {});
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🔨 User Softbanned").setDescription(`${member} was softbanned and their messages were deleted.`).addFields({ name: "Reason", value: reason }).setColor(0xe67e22)] });
      return;
    }

    if (cmd === "mute" || cmd === "timeout") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await message.channel.send("```\n❌ You need Moderate Members permission.\n```");
        return;
      }
      const member = message.mentions.members.first();
      const timeArg = args.find((arg) => /^\d+[smhd]$/i.test(arg));
      const reason = args.filter((arg) => arg !== timeArg && !arg.startsWith("<@")).join(" ") || "No reason";
      if (!member || !timeArg || !canActOn(member, message.member)) {
        await message.channel.send("```\n❌ Usage: !mute @user <10m|1h|1d> [reason]\n```");
        return;
      }
      const seconds = parseDuration(timeArg);
      if (!seconds || seconds > 2419200) {
        await message.channel.send("```\n❌ Maximum timeout is 28 days!\n```");
        return;
      }
      await member.timeout(seconds * 1000, `Muted by ${message.author.tag} | ${reason}`);
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🔇 User Muted").setColor(0xe67e22).addFields(
        { name: "User", value: `${member}`, inline: true },
        { name: "Duration", value: timeArg, inline: true },
        { name: "Reason", value: reason, inline: false },
      )] });
      return;
    }

    if (cmd === "unmute" || cmd === "untimeout") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        await message.channel.send("```\n❌ You need Moderate Members permission.\n```");
        return;
      }
      const member = message.mentions.members.first();
      if (!member) {
        await message.channel.send("```\n❌ Usage: !unmute @user\n```");
        return;
      }
      await member.timeout(null, `Unmuted by ${message.author.tag}`);
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🔊 User Unmuted").setDescription(`${member} has been unmuted.`).setColor(0x2ecc71)] });
      return;
    }

    if (cmd === "warn") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.channel.send("```\n❌ You need Manage Messages permission.\n```");
        return;
      }
      const member = message.mentions.members.first();
      const reason = args.slice(1).join(" ") || "No reason";
      if (!member) {
        await message.channel.send("```\n❌ Usage: !warn @user [reason]\n```");
        return;
      }
      const warning = addWarning(message.guild.id, member.id, { reason, moderator_id: message.author.id });
      const warningsData = getWarnings();
      const total = warningsData[String(message.guild.id)][String(member.id)].length;
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("⚠️ Warning Issued").setColor(0xf1c40f).addFields(
        { name: "User", value: `${member}`, inline: true },
        { name: "Total Warnings", value: String(total), inline: true },
        { name: "Reason", value: reason, inline: false },
      )] });
      await member.send({ embeds: [new EmbedBuilder().setTitle(`⚠️ Warning in ${message.guild.name}`).setDescription(`**Reason:** ${reason}\n**Total Warnings:** ${total}`).setColor(0xf1c40f)] }).catch(() => {});
      return;
    }

    if (cmd === "warnings" || cmd === "warns") {
      const member = message.mentions.members.first() ?? message.member;
      const warningsData = getWarnings();
      const entries = warningsData[String(message.guild.id)]?.[String(member.id)] ?? [];
      if (!entries.length) {
        await message.channel.send(`\`\`\`\n✅ ${member.user.username} has no warnings!\n\`\`\``);
        return;
      }
      const embed = new EmbedBuilder().setTitle(`⚠️ Warnings for ${member.user.username}`).setDescription(`Total: **${entries.length}** warnings`).setColor(0xf1c40f);
      for (const warn of entries.slice(-10)) {
        const modUser = await message.client.users.fetch(warn.moderator_id).catch(() => null);
        embed.addFields({ name: `#${warn.id} - ${warn.timestamp.slice(0, 10)}`, value: `**Reason:** ${warn.reason}\n**By:** ${modUser?.username || "Unknown"}`, inline: false });
      }
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "clearwarns" || cmd === "clearwarnings") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.channel.send("```\n❌ You need Manage Messages permission.\n```");
        return;
      }
      const member = message.mentions.members.first();
      if (!member) {
        await message.channel.send("```\n❌ Usage: !clearwarns @user\n```");
        return;
      }
      const warningsData = getWarnings();
      if (warningsData[String(message.guild.id)]) {
        delete warningsData[String(message.guild.id)][String(member.id)];
        saveWarnings(warningsData);
      }
      await message.channel.send(`\`\`\`\n✅ Cleared all warnings for ${member.user.username}\n\`\`\``);
      return;
    }

    if (["purge", "clear", "clean"].includes(cmd)) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.channel.send("```\n❌ You need Manage Messages permission.\n```");
        return;
      }
      const amount = Number(args[0]);
      if (!amount || amount < 1 || amount > 100) {
        await message.channel.send("```\n❌ Amount must be between 1 and 100!\n```");
        return;
      }
      const deleted = await message.channel.bulkDelete(amount + 1, true);
      await message.channel.send(`\`\`\`\n✅ Deleted ${Math.max(0, deleted.size - 1)} messages\n\`\`\``);
      return;
    }

    if (["purgeuser", "purgebots", "purgelinks", "purgeimages"].includes(cmd)) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.channel.send("```\n❌ You need Manage Messages permission.\n```");
        return;
      }
      const amount = Number(args.at(-1));
      if (!amount || amount < 1 || amount > 100) {
        await message.channel.send("```\n❌ Amount must be 1-100!\n```");
        return;
      }
      const target = message.mentions.members.first();
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const filtered = messages.filter((msg) => {
        if (cmd === "purgeuser") return target && msg.author.id === target.id;
        if (cmd === "purgebots") return msg.author.bot;
        if (cmd === "purgelinks") return /https?:\/\/\S+/.test(msg.content);
        return msg.attachments.size > 0;
      }).first(amount);
      if (filtered.length) {
        await message.channel.bulkDelete(filtered, true);
      }
      await message.channel.send(`\`\`\`\n✅ Deleted ${filtered.length} matching messages\n\`\`\``);
      return;
    }

    if (cmd === "slowmode") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.channel.send("```\n❌ You need Manage Channels permission.\n```");
        return;
      }
      const seconds = Number(args[0] || 0);
      if (seconds < 0 || seconds > 21600) {
        await message.channel.send("```\n❌ Slowmode must be 0-21600 seconds!\n```");
        return;
      }
      await message.channel.setRateLimitPerUser(seconds);
      await message.channel.send(`\`\`\`\n✅ Slowmode ${seconds === 0 ? "disabled" : `set to ${seconds} seconds`}\n\`\`\``);
      return;
    }

    if (cmd === "lock" || cmd === "unlock") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.channel.send("```\n❌ You need Manage Channels permission.\n```");
        return;
      }
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: cmd === "unlock" });
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle(cmd === "lock" ? "🔒 Channel Locked" : "🔓 Channel Unlocked").setDescription(cmd === "lock" ? "This channel has been locked by a moderator." : "This channel has been unlocked.").setColor(cmd === "lock" ? 0xe74c3c : 0x2ecc71)] });
      return;
    }

    if (cmd === "lockdown") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await message.channel.send("```\n❌ You need Administrator permission.\n```");
        return;
      }
      let locked = 0;
      for (const channel of message.guild.channels.cache.filter((c) => c.isTextBased()).values()) {
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false }).catch(() => {});
        locked += 1;
      }
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🚨 LOCKDOWN ACTIVATED").setDescription(`Locked ${locked} channels.`).setColor(0xe74c3c)] });
      return;
    }

    if (cmd === "nuke") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.channel.send("```\n❌ You need Manage Channels permission.\n```");
        return;
      }
      const oldChannel = message.channel;
      const cloned = await oldChannel.clone({
        name: oldChannel.name,
        position: oldChannel.position,
        topic: oldChannel.topic,
        nsfw: oldChannel.nsfw,
        bitrate: oldChannel.bitrate,
        userLimit: oldChannel.userLimit,
        rateLimitPerUser: oldChannel.rateLimitPerUser,
        reason: `Channel nuked by ${message.author.tag}`,
      });
      await oldChannel.delete(`Channel nuked by ${message.author.tag}`).catch(() => {});
      await cloned.send("```\n💥 Channel nuked successfully.\n```");
      return;
    }

    if (cmd === "modlogs") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.channel.send("```\n❌ You need Manage Messages permission.\n```");
        return;
      }
      const member = message.mentions.members.first();
      if (!member) {
        await message.channel.send("```\n❌ Usage: !modlogs @user\n```");
        return;
      }
      const entries = (getModCases()[String(message.guild.id)] ?? []).filter((entry) => entry.user_id === member.id);
      if (!entries.length) {
        await message.channel.send(`\`\`\`\n✅ No moderation history for ${member.user.username}\n\`\`\``);
        return;
      }
      const embed = new EmbedBuilder().setTitle(`📋 Mod Logs for ${member.user.username}`).setDescription(`Total cases: **${entries.length}**`).setColor(0x3498db).setThumbnail(member.displayAvatarURL());
      for (const entry of entries.slice(-10)) {
        const modUser = await message.client.users.fetch(entry.moderator_id).catch(() => null);
        embed.addFields({ name: `Case #${entry.case_id} - ${entry.type.toUpperCase()}`, value: `**Reason:** ${entry.reason}\n**By:** ${modUser?.username || "Unknown"}\n**Date:** ${entry.timestamp.slice(0, 10)}`, inline: false });
      }
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "case") {
      const caseId = Number(args[0]);
      if (!caseId) {
        await message.channel.send("```\n❌ Usage: !case <id>\n```");
        return;
      }
      const entry = (getModCases()[String(message.guild.id)] ?? []).find((item) => item.case_id === caseId);
      if (!entry) {
        await message.channel.send("```\n❌ Case not found!\n```");
        return;
      }
      const user = await message.client.users.fetch(entry.user_id).catch(() => null);
      const modUser = await message.client.users.fetch(entry.moderator_id).catch(() => null);
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle(`📋 Case #${caseId}`).setColor(0x3498db).addFields(
        { name: "Type", value: entry.type.toUpperCase(), inline: true },
        { name: "User", value: user ? `${user}` : `ID: ${entry.user_id}`, inline: true },
        { name: "Moderator", value: modUser ? `${modUser}` : "Unknown", inline: true },
        { name: "Reason", value: entry.reason, inline: false },
        { name: "Date", value: entry.timestamp.slice(0, 19), inline: false },
      )] });
      return;
    }

    if (cmd === "editcase") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        await message.channel.send("```\n❌ You need Manage Messages permission.\n```");
        return;
      }
      const caseId = Number(args[0]);
      const newReason = args.slice(1).join(" ");
      if (!caseId || !newReason) {
        await message.channel.send("```\n❌ Usage: !editcase <id> <reason>\n```");
        return;
      }
      const data = getModCases();
      const entry = (data[String(message.guild.id)] ?? []).find((item) => item.case_id === caseId);
      if (!entry) {
        await message.channel.send("```\n❌ Case not found!\n```");
        return;
      }
      entry.reason = newReason;
      saveModCases(data);
      await message.channel.send(`\`\`\`\n✅ Case #${caseId} reason updated.\n\`\`\``);
    }
  },
};
