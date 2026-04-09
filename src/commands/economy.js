import { EmbedBuilder, PermissionsBitField } from "discord.js";
import {
  deleteUserEconomy,
  getEconomyData,
  saveEconomyData,
  updateUserEconomy,
} from "../state.js";

const shopItems = {
  fishing_rod: { name: "Fishing Rod", price: 500, description: "Catch fish for coins" },
  pickaxe: { name: "Pickaxe", price: 750, description: "Mine for gems" },
  laptop: { name: "Laptop", price: 2000, description: "Work from home bonus" },
  lucky_coin: { name: "Lucky Coin", price: 1500, description: "+10% gambling luck" },
  bank_note: { name: "Bank Note", price: 3000, description: "Increase bank limit" },
  shield: { name: "Shield", price: 5000, description: "Protection from robbery" },
  padlock: { name: "Padlock", price: 2500, description: "Extra security" },
  trophy: { name: "Trophy", price: 10000, description: "Show off your wealth" },
};

function getEconomyUser(data, userId) {
  const key = String(userId);
  if (!data[key]) {
    data[key] = {
      wallet: 0,
      bank: 0,
      inventory: [],
      last_daily: null,
      last_weekly: null,
      last_work: null,
      last_crime: null,
      last_rob: null,
    };
  }
  return data[key];
}

function formatCooldown(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function parseAmount(raw, balance) {
  if (typeof raw !== "string") return Number(raw);
  if (["all", "max"].includes(raw.toLowerCase())) return balance;
  return Number(raw);
}

export const command = {
  name: "balance",
  aliases: [
    "bal",
    "money",
    "daily",
    "weekly",
    "work",
    "deposit",
    "dep",
    "withdraw",
    "with",
    "crime",
    "rob",
    "pay",
    "give",
    "transfer",
    "shop",
    "buyitem",
    "shopbuy",
    "inventory",
    "inv",
    "sell",
    "gamble",
    "bet",
    "slots",
    "blackjack",
    "bj",
    "leaderboard",
    "lb",
    "rich",
    "top",
    "networth",
    "nw",
    "givecoins",
    "removecoins",
    "reseteconomy",
  ],
  async execute({ message, args, config }) {
    const cmd = message.content.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase();
    const economy = getEconomyData();

    if (cmd === "balance" || cmd === "bal" || cmd === "money") {
      const user = message.mentions.members.first() ?? message.member;
      const data = getEconomyUser(economy, user.id);
      saveEconomyData(economy);
      const total = data.wallet + data.bank;
      const embed = new EmbedBuilder()
        .setTitle(`💰 ${user.user.username}'s Balance`)
        .setColor(0xf1c40f)
        .setTimestamp(new Date())
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "Wallet", value: `\`\`\`💲 ${data.wallet.toLocaleString()}\`\`\``, inline: true },
          { name: "Bank", value: `\`\`\`💲 ${data.bank.toLocaleString()}\`\`\``, inline: true },
          { name: "Net Worth", value: `\`\`\`💲 ${total.toLocaleString()}\`\`\``, inline: true }
        );
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "daily" || cmd === "weekly") {
      const data = getEconomyUser(economy, message.author.id);
      const now = Date.now();
      const field = cmd === "daily" ? "last_daily" : "last_weekly";
      const cooldown = cmd === "daily" ? 86400 : 604800;
      if (data[field]) {
        const elapsed = (now - new Date(data[field]).getTime()) / 1000;
        if (elapsed < cooldown) {
          await message.channel.send(`\`\`\`\n⏰ ${cmd} already claimed!\nCome back in ${formatCooldown(cooldown - elapsed)}\n\`\`\``);
          return;
        }
      }
      const reward = cmd === "daily" ? 500 + Math.floor(Math.random() * 501) : 5000 + Math.floor(Math.random() * 5001);
      data.wallet += reward;
      data[field] = new Date(now).toISOString();
      saveEconomyData(economy);
      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🎁 ${cmd === "daily" ? "Daily" : "Weekly"} Reward Claimed!`)
            .setDescription(`You received **💲 ${reward.toLocaleString()}**`)
            .setColor(0x2ecc71),
        ],
      });
      return;
    }

    if (cmd === "work") {
      const data = getEconomyUser(economy, message.author.id);
      const now = Date.now();
      if (data.last_work) {
        const elapsed = (now - new Date(data.last_work).getTime()) / 1000;
        if (elapsed < 3600) {
          await message.channel.send(`\`\`\`\n⏰ You're tired! Rest for ${Math.floor((3600 - elapsed) / 60)} minutes\n\`\`\``);
          return;
        }
      }
      const jobs = [
        ["Coded a website", 200, 500],
        ["Delivered pizzas", 150, 400],
        ["Drove an Uber", 180, 450],
        ["Amazon delivery", 160, 420],
        ["Construction work", 200, 550],
        ["Designed a logo", 250, 600],
        ["Wrote articles", 220, 500],
        ["Edited videos", 280, 650],
      ];
      const [job, minPay, maxPay] = jobs[Math.floor(Math.random() * jobs.length)];
      const payment = minPay + Math.floor(Math.random() * (maxPay - minPay + 1));
      data.wallet += payment;
      data.last_work = new Date(now).toISOString();
      saveEconomyData(economy);
      await message.channel.send({
        embeds: [new EmbedBuilder().setTitle("💼 Work Complete!").setDescription(`${job}\nYou earned **💲 ${payment.toLocaleString()}**`).setColor(0x3498db)],
      });
      return;
    }

    if (cmd === "deposit" || cmd === "dep" || cmd === "withdraw" || cmd === "with") {
      const data = getEconomyUser(economy, message.author.id);
      const amount = parseAmount(args[0], cmd.startsWith("dep") ? data.wallet : data.bank);
      if (!Number.isFinite(amount) || amount <= 0) {
        await message.channel.send("```\n❌ Amount must be positive!\n```");
        return;
      }
      if ((cmd === "deposit" || cmd === "dep") && amount > data.wallet) {
        await message.channel.send("```\n❌ You don't have that much!\n```");
        return;
      }
      if ((cmd === "withdraw" || cmd === "with") && amount > data.bank) {
        await message.channel.send("```\n❌ You don't have that much in bank!\n```");
        return;
      }
      if (cmd === "deposit" || cmd === "dep") {
        data.wallet -= amount;
        data.bank += amount;
      } else {
        data.bank -= amount;
        data.wallet += amount;
      }
      saveEconomyData(economy);
      await message.channel.send(
        "```\n" +
          `✅ ${cmd.startsWith("dep") ? "Deposited" : "Withdrew"} 💲 ${amount.toLocaleString()}\n` +
          `💵 Wallet: 💲 ${data.wallet.toLocaleString()}\n` +
          `🏦 Bank: 💲 ${data.bank.toLocaleString()}\n` +
          "```"
      );
      return;
    }

    if (cmd === "crime") {
      const data = getEconomyUser(economy, message.author.id);
      const now = Date.now();
      if (data.last_crime) {
        const elapsed = (now - new Date(data.last_crime).getTime()) / 1000;
        if (elapsed < 3600) {
          await message.channel.send(`\`\`\`\n⏰ Wait ${Math.floor((3600 - elapsed) / 60)} minutes before committing another crime!\n\`\`\``);
          return;
        }
      }
      const crimes = [
        ["Robbed a bank", 500, 2000, 0.4],
        ["Stole jewelry", 300, 1500, 0.5],
        ["Stole a car", 400, 1800, 0.45],
        ["Hacked a company", 600, 2500, 0.35],
        ["Rigged a casino", 800, 3000, 0.3],
      ];
      const [crime, minReward, maxReward, successRate] = crimes[Math.floor(Math.random() * crimes.length)];
      data.last_crime = new Date(now).toISOString();
      let embed;
      if (Math.random() < successRate) {
        const reward = minReward + Math.floor(Math.random() * (maxReward - minReward + 1));
        data.wallet += reward;
        embed = new EmbedBuilder().setTitle("✅ Crime Successful!").setDescription(`${crime}\nYou got away with **💲 ${reward.toLocaleString()}**`).setColor(0x2ecc71);
      } else {
        const fine = 200 + Math.floor(Math.random() * 301);
        data.wallet = Math.max(0, data.wallet - fine);
        embed = new EmbedBuilder().setTitle("❌ You Got Caught!").setDescription(`The police caught you!\nYou paid a fine of **💲 ${fine.toLocaleString()}**`).setColor(0xe74c3c);
      }
      saveEconomyData(economy);
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "rob") {
      const target = message.mentions.members.first();
      if (!target) {
        await message.channel.send("```\n❌ Usage: !rob @user\n```");
        return;
      }
      if (target.id === message.author.id || target.user.bot) {
        await message.channel.send("```\n❌ Invalid robbery target!\n```");
        return;
      }
      const robber = getEconomyUser(economy, message.author.id);
      const victim = getEconomyUser(economy, target.id);
      const now = Date.now();
      if (robber.last_rob) {
        const elapsed = (now - new Date(robber.last_rob).getTime()) / 1000;
        if (elapsed < 7200) {
          await message.channel.send(`\`\`\`\n⏰ Wait ${formatCooldown(7200 - elapsed)} before robbing again!\n\`\`\``);
          return;
        }
      }
      if (victim.wallet < 100) {
        await message.channel.send("```\n❌ They're too poor to rob!\n```");
        return;
      }
      if (victim.inventory.includes("shield")) {
        await message.channel.send(`\`\`\`\n🛡️ ${target.user.username} has a shield! You can't rob them.\n\`\`\``);
        return;
      }
      robber.last_rob = new Date(now).toISOString();
      let embed;
      if (Math.random() < 0.5) {
        const stolen = Math.max(1, Math.floor(victim.wallet * (0.1 + Math.random() * 0.4)));
        victim.wallet -= stolen;
        robber.wallet += stolen;
        embed = new EmbedBuilder().setTitle("💰 Robbery Successful!").setDescription(`You stole **💲 ${stolen.toLocaleString()}** from ${target}!`).setColor(0x2ecc71);
      } else {
        const fine = 100 + Math.floor(Math.random() * 201);
        robber.wallet = Math.max(0, robber.wallet - fine);
        embed = new EmbedBuilder().setTitle("❌ Robbery Failed!").setDescription(`${target} caught you!\nYou paid **💲 ${fine.toLocaleString()}** in damages.`).setColor(0xe74c3c);
      }
      saveEconomyData(economy);
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "pay" || cmd === "give" || cmd === "transfer") {
      const target = message.mentions.members.first();
      const amount = Number(args.find((arg) => /^\d+$/.test(arg)));
      if (!target || !amount || amount <= 0 || target.id === message.author.id) {
        await message.channel.send("```\n❌ Usage: !pay @user <amount>\n```");
        return;
      }
      const payer = getEconomyUser(economy, message.author.id);
      const receiver = getEconomyUser(economy, target.id);
      if (payer.wallet < amount) {
        await message.channel.send("```\n❌ You don't have enough money!\n```");
        return;
      }
      payer.wallet -= amount;
      receiver.wallet += amount;
      saveEconomyData(economy);
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("💸 Payment Sent").setDescription(`You sent **💲 ${amount.toLocaleString()}** to ${target}`).setColor(0x2ecc71)] });
      return;
    }

    if (cmd === "shop") {
      const embed = new EmbedBuilder().setTitle("🛒 Shop").setDescription("Use `!buyitem <item>` to purchase").setColor(0x3498db).setTimestamp(new Date());
      for (const [itemId, item] of Object.entries(shopItems)) {
        embed.addFields({ name: `${item.name} - 💲 ${item.price.toLocaleString()}`, value: `\`\`\`${item.description}\nID: ${itemId}\`\`\``, inline: false });
      }
      await message.channel.send({ embeds: [embed] });
      return;
    }

    if (cmd === "buyitem" || cmd === "shopbuy") {
      const itemId = (args[0] || "").toLowerCase();
      if (!shopItems[itemId]) {
        await message.channel.send("```\n❌ Item not found! Use !shop to see available items.\n```");
        return;
      }
      const data = getEconomyUser(economy, message.author.id);
      const item = shopItems[itemId];
      if (data.wallet < item.price) {
        await message.channel.send(`\`\`\`\n❌ You need 💲 ${item.price.toLocaleString()} to buy this!\n\`\`\``);
        return;
      }
      data.wallet -= item.price;
      data.inventory.push(itemId);
      saveEconomyData(economy);
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("✅ Purchase Successful!").setDescription(`You bought ${item.name} for **💲 ${item.price.toLocaleString()}**`).setColor(0x2ecc71)] });
      return;
    }

    if (cmd === "inventory" || cmd === "inv") {
      const user = message.mentions.members.first() ?? message.member;
      const data = getEconomyUser(economy, user.id);
      if (!data.inventory.length) {
        await message.channel.send(`\`\`\`\n📦 ${user.user.username}'s inventory is empty!\n\`\`\``);
        return;
      }
      const counts = {};
      for (const itemId of data.inventory) counts[itemId] = (counts[itemId] || 0) + 1;
      const body = Object.entries(counts)
        .map(([itemId, count]) => `${shopItems[itemId]?.name || itemId} x${count}`)
        .join("\n");
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle(`📦 ${user.user.username}'s Inventory`).setColor(0x3498db).setDescription(`\`\`\`\n${body}\n\`\`\``)] });
      return;
    }

    if (cmd === "sell") {
      const itemId = (args[0] || "").toLowerCase();
      const data = getEconomyUser(economy, message.author.id);
      if (!data.inventory.includes(itemId) || !shopItems[itemId]) {
        await message.channel.send("```\n❌ You don't have this item!\n```");
        return;
      }
      data.inventory.splice(data.inventory.indexOf(itemId), 1);
      const sellPrice = Math.floor(shopItems[itemId].price / 2);
      data.wallet += sellPrice;
      saveEconomyData(economy);
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("💰 Item Sold").setDescription(`You sold ${shopItems[itemId].name} for **💲 ${sellPrice.toLocaleString()}**`).setColor(0x2ecc71)] });
      return;
    }

    if (cmd === "gamble" || cmd === "bet") {
      const data = getEconomyUser(economy, message.author.id);
      const amount = parseAmount(args[0], data.wallet);
      if (!Number.isFinite(amount) || amount <= 0 || amount > data.wallet) {
        await message.channel.send("```\n❌ Invalid gamble amount!\n```");
        return;
      }
      let color = 0xe74c3c;
      let description;
      if (Math.random() < 0.45) {
        data.wallet += amount;
        color = 0x2ecc71;
        description = `You won **💲 ${amount.toLocaleString()}**\nNew balance: **💲 ${data.wallet.toLocaleString()}**`;
      } else {
        data.wallet -= amount;
        description = `You lost **💲 ${amount.toLocaleString()}**\nNew balance: **💲 ${data.wallet.toLocaleString()}**`;
      }
      saveEconomyData(economy);
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🎰 Gamble").setDescription(description).setColor(color)] });
      return;
    }

    if (cmd === "slots") {
      const amount = Number(args[0]);
      const data = getEconomyUser(economy, message.author.id);
      if (!amount || amount <= 0 || amount > data.wallet) {
        await message.channel.send("```\n❌ Invalid slot amount!\n```");
        return;
      }
      data.wallet -= amount;
      const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "🔔", "⭐"];
      const reel = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
      let multiplier = 0;
      if (reel[0] === reel[1] && reel[1] === reel[2]) {
        multiplier = reel[0] === "7️⃣" ? 100 : reel[0] === "💎" ? 50 : reel[0] === "⭐" ? 25 : 10;
      } else if (reel[0] === reel[1] || reel[1] === reel[2] || reel[0] === reel[2]) {
        multiplier = 2;
      }
      const winnings = amount * multiplier;
      data.wallet += winnings;
      saveEconomyData(economy);
      const won = multiplier > 0;
      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("🎰 Slot Machine")
            .setColor(won ? 0x2ecc71 : 0xe74c3c)
            .addFields(
              { name: "Result", value: `\`\`\`\n[ ${reel.join(" | ")} ]\n\`\`\``, inline: false },
              { name: won ? "You Won!" : "You Lost", value: won ? `**💲 ${winnings.toLocaleString()}** (${multiplier}x)` : "Better luck next time!", inline: false },
              { name: "Balance", value: `💲 ${data.wallet.toLocaleString()}`, inline: false }
            ),
        ],
      });
      return;
    }

    if (cmd === "blackjack" || cmd === "bj") {
      const amount = args[0]?.toLowerCase() === "all"
        ? getUserEconomy(message.author.id).wallet
        : Number(args[0]);
      if (!amount || amount < 1) {
        await message.channel.send("```\n❌ Usage: !blackjack <amount>\n```");
        return;
      }
      let resultText = "";
      let color = 0xf1c40f;
      updateUserEconomy(message.author.id, (data) => {
        if (data.wallet < amount) {
          resultText = "❌ You don't have enough coins!";
          color = 0xe74c3c;
          return;
        }
        const player = 12 + Math.floor(Math.random() * 10);
        const dealer = 12 + Math.floor(Math.random() * 10);
        if (player > 21) {
          data.wallet -= amount;
          resultText = `You busted with **${player}**. Dealer had **${dealer}**.\nYou lost **${amount}** coins.`;
          color = 0xe74c3c;
          return;
        }
        if (dealer > 21 || player > dealer) {
          data.wallet += amount;
          resultText = `You drew **${player}** and dealer drew **${dealer}**.\nYou won **${amount}** coins!`;
          color = 0x2ecc71;
          return;
        }
        if (player === dealer) {
          resultText = `Push. You and the dealer both drew **${player}**.`;
          color = 0xf1c40f;
          return;
        }
        data.wallet -= amount;
        resultText = `You drew **${player}** and dealer drew **${dealer}**.\nYou lost **${amount}** coins.`;
        color = 0xe74c3c;
      });
      await message.channel.send({
        embeds: [new EmbedBuilder().setTitle("🃏 Blackjack").setColor(color).setDescription(resultText)],
      });
      return;
    }

    if (cmd === "leaderboard" || cmd === "lb" || cmd === "rich" || cmd === "top") {
      const topUsers = Object.entries(economy)
        .sort((a, b) => (b[1].wallet + b[1].bank) - (a[1].wallet + a[1].bank))
        .slice(0, 10);
      const medals = ["🥇", "🥈", "🥉"];
      const lines = await Promise.all(
        topUsers.map(async ([userId, data], index) => {
          const user = await message.client.users.fetch(userId).catch(() => null);
          const name = user?.username ?? `Unknown (${userId})`;
          const total = (data.wallet || 0) + (data.bank || 0);
          return `${medals[index] || `#${index + 1}`} **${name}** - 💲 ${total.toLocaleString()}`;
        })
      );
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🏆 Leaderboard - Richest Users").setColor(0xf1c40f).setTimestamp(new Date()).setDescription(lines.join("\n") || "No data yet!")] });
      return;
    }

    if (cmd === "networth" || cmd === "nw") {
      const user = message.mentions.members.first() ?? message.member;
      const data = getEconomyUser(economy, user.id);
      const inventoryValue = data.inventory.reduce((sum, itemId) => sum + (shopItems[itemId]?.price || 0), 0);
      const total = data.wallet + data.bank + inventoryValue;
      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`💎 ${user.user.username}'s Net Worth`)
            .setColor(0xf1c40f)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
              { name: "Wallet", value: `💲 ${data.wallet.toLocaleString()}`, inline: true },
              { name: "Bank", value: `💲 ${data.bank.toLocaleString()}`, inline: true },
              { name: "Inventory", value: `💲 ${inventoryValue.toLocaleString()}`, inline: true },
              { name: "Total", value: `**💲 ${total.toLocaleString()}**`, inline: false }
            ),
        ],
      });
      return;
    }

    if (cmd === "givecoins" || cmd === "removecoins" || cmd === "reseteconomy") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await message.channel.send("```\n❌ You need Administrator permission.\n```");
        return;
      }
      const target = message.mentions.members.first();
      if (!target) {
        await message.channel.send(`\`\`\`\n❌ Usage: !${cmd} @user${cmd === "reseteconomy" ? "" : " <amount>"}\n\`\`\``);
        return;
      }
      if (cmd === "reseteconomy") {
        deleteUserEconomy(target.id);
        await message.channel.send(`\`\`\`\n✅ Reset economy for ${target.user.username}\n\`\`\``);
        return;
      }
      const amount = Number(args.find((arg) => /^\d+$/.test(arg)));
      if (!amount || amount <= 0) {
        await message.channel.send("```\n❌ Amount must be positive!\n```");
        return;
      }
      updateUserEconomy(target.id, (data) => {
        if (cmd === "givecoins") data.wallet += amount;
        else data.wallet = Math.max(0, data.wallet - amount);
      });
      await message.channel.send(`\`\`\`\n✅ ${cmd === "givecoins" ? "Gave" : "Removed"} 💲 ${amount.toLocaleString()} ${cmd === "givecoins" ? "to" : "from"} ${target.user.username}\n\`\`\``);
    }
  },
};
