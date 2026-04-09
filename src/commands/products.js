import { EmbedBuilder } from "discord.js";
import { db } from "../db.js";

export const command = {
  name: "products",
  aliases: ["product", "buy", "orders", "order", "addproduct", "removeproduct"],
  async execute({ message, args, config }) {
    const cmd = message.content.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase();

    if (cmd === "products") {
      const category = args[0];
      const products = db.getProducts(category);
      const embed = new EmbedBuilder()
        .setTitle(`🛒 Available Products - ${category || "All"}`)
        .setDescription("Browse our premium tools and indicators")
        .setColor(0x00ff9d)
        .setTimestamp(new Date());
      if (!products.length) {
        embed.addFields({ name: "📭 No Products", value: "No products available in this category" });
      } else {
        for (const product of products.slice(0, 10)) {
          embed.addFields({
            name: product.name,
            value: `💰 **$${product.price}**\n📝 ${product.description.slice(0, 100)}...\n🆔 Product ID: \`${product.id}\``,
            inline: false,
          });
        }
      }
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "product") {
      const productId = Number(args[0]);
      if (!productId) {
        await message.channel.send("```\n❌ Usage: !product <id>\n```");
        return;
      }
      const product = db.getProductById(productId);
      if (!product) {
        await message.channel.send("```\n❌ Product not found.\n```");
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(`🛡️ ${product.name}`)
        .setDescription(product.description)
        .setColor(0x00ff9d)
        .setTimestamp(new Date())
        .addFields(
          { name: "💰 Price", value: `$${product.price}`, inline: true },
          { name: "📦 Category", value: product.category || "Unknown", inline: true },
          { name: "📊 Stock", value: `${product.stock ?? "Unlimited"}`, inline: true }
        );
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "buy") {
      const productId = Number(args[0]);
      if (!productId) {
        await message.channel.send("```\n❌ Usage: !buy <id>\n```");
        return;
      }
      const product = db.getProductById(productId);
      if (!product) {
        await message.channel.send("```\n❌ Product not found.\n```");
        return;
      }
      const order = db.createOrder({
        user_id: message.author.id,
        product_id: productId,
        price: product.price,
        status: "pending",
      });

      const orderEmbed = new EmbedBuilder()
        .setTitle("🎉 Order Confirmation")
        .setDescription("Thank you for your purchase!")
        .setColor(0x00ff00)
        .setTimestamp(new Date())
        .addFields(
          { name: "📦 Product", value: product.name, inline: false },
          { name: "🆔 Order ID", value: order.order_id, inline: true },
          { name: "💰 Total", value: `$${product.price}`, inline: true },
          { name: "📊 Status", value: order.status.toUpperCase(), inline: true }
        );

      try {
        await message.author.send({ embeds: [orderEmbed] });
        await message.channel.send("```\n✅ Order created! Check your DMs for details.\n```");
      } catch {
        await message.channel.send("```\n❌ Cannot send DM. Please enable DMs.\n```");
      }
      return;
    }

    if (cmd === "orders") {
      const orders = db.getUserOrders(message.author.id);
      if (!orders.length) {
        await message.channel.send("```\n📭 You have no orders yet.\n```");
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle("📦 Your Orders")
        .setDescription(`Total Orders: ${orders.length}`)
        .setColor(0x00ff9d);
      for (const order of orders.slice(0, 10)) {
        embed.addFields({
          name: order.order_id,
          value: `Product ID: ${order.product_id}\nStatus: ${order.status}`,
          inline: false,
        });
      }
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "order") {
      const orderId = args[0];
      if (!orderId) {
        await message.channel.send("```\n❌ Usage: !order <id>\n```");
        return;
      }
      const order = db.getOrder(orderId);
      if (!order || order.user_id !== message.author.id) {
        await message.channel.send("```\n❌ Order not found.\n```");
        return;
      }
      const embed = new EmbedBuilder()
        .setTitle(`📦 Order ${order.order_id}`)
        .setColor(0x00ff9d)
        .addFields(
          { name: "Product ID", value: String(order.product_id), inline: true },
          { name: "Status", value: order.status, inline: true },
          { name: "Created At", value: order.created_at, inline: true }
        );
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "addproduct") {
      if (!message.member.permissions.has("Administrator")) {
        await message.channel.send("```\n❌ You need Administrator permission.\n```");
        return;
      }
      const filter = (m) => m.author.id === message.author.id;

      const prompts = [
        "Product Name:",
        "Description:",
        "Price (number only):",
        "Category:",
        "Features (comma separated):",
        "Image URL (optional, type 'skip' to skip):",
        "Stock (type 'unlimited' for unlimited):",
      ];

      const answers = [];
      for (const prompt of prompts) {
        await message.channel.send(`**${prompt}**`);
        const msg = await message.channel.awaitMessages({ filter, max: 1, time: 120000 });
        if (!msg.size) {
          await message.channel.send("```\n⏱️ Timeout! Product addition cancelled.\n```");
          return;
        }
        answers.push(msg.first().content);
      }

      const [name, description, priceRaw, category, featuresRaw, imageRaw, stockRaw] = answers;
      const product = db.addProduct({
        name,
        description,
        price: Number(priceRaw),
        category,
        features: featuresRaw.split(",").map((f) => f.trim()),
        image_url: imageRaw.toLowerCase() === "skip" ? null : imageRaw,
        stock: stockRaw.toLowerCase() === "unlimited" ? "Unlimited" : Number(stockRaw),
      });

      await message.channel.send(`✅ Product added: ${product.name}`);
      return;
    }

    if (cmd === "removeproduct") {
      if (!message.member.permissions.has("Administrator")) {
        await message.channel.send("```\n❌ You need Administrator permission.\n```");
        return;
      }
      const id = Number(args[0]);
      if (!id) {
        await message.channel.send("```\n❌ Usage: !removeproduct <id>\n```");
        return;
      }
      const product = db.getProductById(id);
      if (!product) {
        await message.channel.send("```\n❌ Product not found.\n```");
        return;
      }
      db.deleteProduct(id);
      await message.channel.send(`✅ Product **${product.name}** removed.`);
    }
  },
};
