import { AttachmentBuilder, ChannelType, EmbedBuilder, PermissionsBitField } from "discord.js";
import { db } from "../db.js";

export const command = {
  name: "ticket",
  aliases: ["closeticket", "mytickets", "add", "remove", "adduser", "removeuser", "rename", "transcript"],
  async execute({ message, args, config, cmd }) {
    if (cmd === "ticket") {
      const reason = args.join(" ") || "Support Request";
      const categoryId = config.ticket_category;
      if (!categoryId) {
        await message.channel.send("```\n❌ Ticket system not configured.\n```");
        return;
      }

      const open = db.getUserTickets(message.author.id).filter((t) => t.status === "open");
      if (open.length) {
        await message.channel.send("```\n❌ You already have an open ticket.\n```");
        return;
      }

      const ticket = db.createTicket({
        user_id: message.author.id,
        type: "support",
        description: reason,
      });

      const category = await message.guild.channels.fetch(categoryId).catch(() => null);
      if (!category) {
        await message.channel.send("```\n❌ Ticket category not found.\n```");
        return;
      }

      const channel = await message.guild.channels.create({
        name: `ticket-${ticket.ticket_id}`,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: message.author.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: message.guild.members.me.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
          },
        ],
      });

      db.updateTicket(ticket.ticket_id, { channel_id: channel.id });

      const embed = new EmbedBuilder()
        .setTitle(`🎫 Support Ticket - ${ticket.ticket_id}`)
        .setDescription(`Hello ${message.author}! Support will be with you shortly.`)
        .setColor(0x00ff9d)
        .addFields(
          { name: "📝 Reason", value: reason, inline: false },
          { name: "ℹ️ Information", value: "• Describe your issue\n• Use `!closeticket` to close", inline: false }
        );

      await channel.send({ content: `${message.author}`, embeds: [embed] });
      await message.channel.send(`✅ Ticket created: ${channel}`);
      return;
    }

    if (cmd === "closeticket") {
      if (!message.channel.name.startsWith("ticket-") && !message.channel.name.startsWith("order-")) {
        await message.channel.send("```\n❌ This is not a ticket channel.\n```");
        return;
      }
      const ticketId = message.channel.name.split("ticket-")[1] || message.channel.name.split("order-")[1];
      if (ticketId) {
        const ticketKey = ticketId.startsWith("TICKET") ? ticketId : `TICKET-${ticketId}`;
        db.updateTicket(ticketKey, { status: "closed" });
      }
      await message.channel.delete();
      return;
    }

    if (cmd === "mytickets") {
      const tickets = db.getUserTickets(message.author.id);
      if (!tickets.length) {
        await message.channel.send("```\n📭 You have no tickets.\n```");
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle("🎫 Your Tickets")
        .setColor(0x00ff9d);
      for (const ticket of tickets.slice(0, 10)) {
        embed.addFields({
          name: ticket.ticket_id,
          value: `Status: ${ticket.status}\nCreated: ${ticket.created_at}`,
          inline: false,
        });
      }
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "add" || cmd === "remove" || cmd === "adduser" || cmd === "removeuser") {
      if (!message.channel.name.startsWith("ticket-") && !message.channel.name.startsWith("order-")) {
        await message.channel.send("```\n❌ This is not a ticket channel.\n```");
        return;
      }
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.channel.send("```\n❌ You need Manage Channels permission.\n```");
        return;
      }
      const target = message.mentions.users.first();
      const action = cmd === "add" || cmd === "adduser" ? "add" : "remove";
      if (!target) {
        await message.channel.send(`\`\`\`\n❌ Usage: !${action} @user\n\`\`\``);
        return;
      }
      await message.channel.permissionOverwrites.edit(target.id, {
        ViewChannel: action === "add",
        SendMessages: action === "add",
        ReadMessageHistory: action === "add",
      });
      await message.channel.send(`✅ ${action === "add" ? "Added" : "Removed"} ${target} ${action === "add" ? "to" : "from"} this ticket.`);
      return;
    }

    if (cmd === "rename") {
      if (!message.channel.name.startsWith("ticket-") && !message.channel.name.startsWith("order-")) {
        await message.channel.send("```\n❌ This is not a ticket channel.\n```");
        return;
      }
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        await message.channel.send("```\n❌ You need Manage Channels permission.\n```");
        return;
      }
      const name = args.join("-").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
      if (!name) {
        await message.channel.send("```\n❌ Usage: !rename <new-name>\n```");
        return;
      }
      await message.channel.setName(name);
      await message.channel.send(`✅ Ticket renamed to **${name}**`);
      return;
    }

    if (cmd === "transcript") {
      if (!message.channel.name.startsWith("ticket-") && !message.channel.name.startsWith("order-")) {
        await message.channel.send("```\n❌ This is not a ticket channel.\n```");
        return;
      }
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const transcript = messages
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .map((entry) => `[${new Date(entry.createdTimestamp).toISOString()}] ${entry.author.tag}: ${entry.content || "[embed/attachment]"}`)
        .join("\n");
      const attachment = new AttachmentBuilder(Buffer.from(transcript || "No messages found."), {
        name: `${message.channel.name}-transcript.txt`,
      });
      await message.channel.send({ files: [attachment] });
      return;
    }
  },
};
