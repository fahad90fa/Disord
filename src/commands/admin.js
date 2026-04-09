import { EmbedBuilder, PermissionsBitField } from "discord.js";
import os from "node:os";
import { db } from "../db.js";

export const command = {
  name: "setstatus",
  aliases: ["stats", "ping", "ownerpurge", "opurge"],
  async execute({ message, args, config }) {
    const cmd = message.content.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase();

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
  },
};
