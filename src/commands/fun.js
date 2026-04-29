import { EmbedBuilder } from "discord.js";

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "Why did the scarecrow win an award? He was outstanding in his field!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "Why don't programmers like nature? It has too many bugs.",
  "What do you call a fake noodle? An impasta!",
];

const facts = [
  "Honey never spoils.",
  "Octopuses have three hearts and blue blood.",
  "A day on Venus is longer than a year on Venus.",
  "Bananas are berries, but strawberries aren't.",
  "Sharks existed before trees.",
];

const quotes = [
  ["The only way to do great work is to love what you do.", "Steve Jobs"],
  ["In the middle of difficulty lies opportunity.", "Albert Einstein"],
  ["Believe you can and you're halfway there.", "Theodore Roosevelt"],
  ["Success is not final, failure is not fatal.", "Winston Churchill"],
];

const truths = [
  "What's your biggest fear?",
  "What's the most embarrassing thing you've done?",
  "What's a secret you've never told anyone?",
  "What's your biggest regret?",
];

const dares = [
  "Send the last photo you took to this channel",
  "Do 10 push-ups right now",
  "Talk in an accent for the next 10 minutes",
  "Share your most played song",
];

const riddles = [
  { riddle: "What has keys but no locks?", answer: "A piano" },
  { riddle: "What has hands but can't clap?", answer: "A clock" },
  { riddle: "What can you catch but not throw?", answer: "A cold" },
];

const triviaQuestions = [
  { question: "What is the capital of France?", answer: "paris" },
  { question: "How many planets are in our solar system?", answer: "8" },
  { question: "Who painted the Mona Lisa?", answer: "leonardo da vinci" },
];

const socialText = {
  roast: (user) => [
    `${user.username} is the reason we have warning labels on everything.`,
    `I'd explain it to ${user.username}, but I don't have crayons.`,
    `I've seen smarter rocks than ${user.username}.`,
  ],
  compliment: (user) => [
    `${user.username}, you're more beautiful than a sunset!`,
    `${user.username} has a smile that lights up the room.`,
    `The world is better because ${user.username} is in it.`,
  ],
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function simpleEmbed(title, description, color = 0x3498db) {
  return new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);
}

async function askTrivia(message, item) {
  await message.channel.send({ embeds: [simpleEmbed("🧩 Trivia Time!", item.question, 0xf1c40f).setFooter({ text: "You have 30 seconds to answer!" })] });
  const collected = await message.channel.awaitMessages({
    filter: (m) => m.author.id === message.author.id,
    max: 1,
    time: 30000,
  });
  if (!collected.size) {
    await message.channel.send(`\`\`\`\n⏰ Time's up! The answer was: ${item.answer}\n\`\`\``);
    return;
  }
  const answer = collected.first().content.toLowerCase().trim();
  await message.channel.send(answer === item.answer ? "```\n✅ Correct! Well done!\n```" : `\`\`\`\n❌ Wrong! The answer was: ${item.answer}\n\`\`\``);
}

export const command = {
  name: "8ball",
  aliases: [
    "coinflip",
    "flip",
    "roll",
    "rps",
    "fight",
    "roast",
    "compliment",
    "hug",
    "slap",
    "kiss",
    "kill",
    "rate",
    "ship",
    "iq",
    "pp",
    "gayrate",
    "simprate",
    "hack",
    "meme",
    "joke",
    "fact",
    "quote",
    "wouldyourather",
    "wyr",
    "truth",
    "dare",
    "neverhaveiever",
    "nhie",
    "thisorthat",
    "tot",
    "trivia",
    "riddle",
  ],
  async execute({ message, args, config, cmd }) {
    if (cmd === "8ball") {
      const question = args.join(" ");
      if (!question) {
        await message.channel.send("```\n❌ Usage: !8ball <question>\n```");
        return;
      }
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("🎱 Magic 8Ball").setColor(0x9b59b6).addFields(
        { name: "Question", value: question, inline: false },
        { name: "Answer", value: `**${pick(["Yes, definitely!", "Without a doubt!", "Most likely", "Maybe...", "Don't count on it", "Absolutely not!"])}**`, inline: false },
      )] });
      return;
    }

    if (cmd === "coinflip" || cmd === "flip") {
      await message.channel.send({ embeds: [simpleEmbed("🪙 Coin Flip", `The coin landed on **${pick(["Heads", "Tails"])}**!`, 0xf1c40f)] });
      return;
    }

    if (cmd === "roll") {
      const raw = args[0] || "1d6";
      const match = /^(\d+)d(\d+)$/i.exec(raw);
      if (!match) {
        await message.channel.send("```\n❌ Use dice format like 2d6 or 1d20.\n```");
        return;
      }
      const rolls = Number(match[1]);
      const sides = Number(match[2]);
      if (rolls < 1 || rolls > 100 || sides < 2 || sides > 1000) {
        await message.channel.send("```\n❌ Invalid dice range.\n```");
        return;
      }
      const results = Array.from({ length: rolls }, () => 1 + Math.floor(Math.random() * sides));
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle(`🎲 Dice Roll: ${raw}`).setColor(0x3498db).addFields(
        { name: "Results", value: `\`\`\`${results.join(", ")}\`\`\``, inline: false },
        { name: "Total", value: `**${results.reduce((sum, n) => sum + n, 0)}**`, inline: false },
      )] });
      return;
    }

    if (cmd === "rps") {
      const choice = (args[0] || "").toLowerCase();
      const choices = ["rock", "paper", "scissors"];
      if (!choices.includes(choice)) {
        await message.channel.send("```\n❌ Choose rock, paper, or scissors!\n```");
        return;
      }
      const botChoice = pick(choices);
      const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
      const result = choice === botChoice ? "It's a tie!" : beats[choice] === botChoice ? "You win!" : "You lose!";
      const color = result === "You win!" ? 0x2ecc71 : result === "You lose!" ? 0xe74c3c : 0xf1c40f;
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("✊ Rock Paper Scissors").setColor(color).addFields(
        { name: "Your Choice", value: choice, inline: true },
        { name: "Bot's Choice", value: botChoice, inline: true },
        { name: "Result", value: `**${result}**`, inline: false },
      )] });
      return;
    }

    if (cmd === "fight") {
      const target = message.mentions.members.first();
      if (!target || target.id === message.author.id) {
        await message.channel.send("```\n❌ Usage: !fight @user\n```");
        return;
      }
      let hp1 = 100;
      let hp2 = 100;
      const attacks = [["punched", 10, 25], ["kicked", 15, 30], ["slapped", 5, 15], ["headbutted", 20, 35]];
      const log = [];
      while (hp1 > 0 && hp2 > 0) {
        const [attack1, min1, max1] = pick(attacks);
        const dmg1 = min1 + Math.floor(Math.random() * (max1 - min1 + 1));
        hp2 -= dmg1;
        log.push(`${message.author.username} ${attack1} ${target.user.username} for ${dmg1} damage!`);
        if (hp2 <= 0) break;
        const [attack2, min2, max2] = pick(attacks);
        const dmg2 = min2 + Math.floor(Math.random() * (max2 - min2 + 1));
        hp1 -= dmg2;
        log.push(`${target.user.username} ${attack2} ${message.author.username} for ${dmg2} damage!`);
      }
      const winner = hp2 <= 0 ? message.author.username : target.user.username;
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("⚔️ FIGHT!").setColor(0xe74c3c).addFields(
        { name: "Battle Log", value: `\`\`\`\n${log.slice(-5).join("\n")}\n\`\`\``, inline: false },
        { name: "Winner", value: `**${winner}** wins!`, inline: false },
      )] });
      return;
    }

    if (cmd === "roast" || cmd === "compliment") {
      const user = message.mentions.users.first() ?? message.author;
      const lines = socialText[cmd](user);
      const color = cmd === "roast" ? 0xe74c3c : 0xff69b4;
      const title = cmd === "roast" ? "🔥 ROASTED" : "💖 Compliment";
      await message.channel.send({ embeds: [simpleEmbed(title, pick(lines), color).setThumbnail(user.displayAvatarURL())] });
      return;
    }

    if (["hug", "slap", "kiss", "kill"].includes(cmd)) {
      const user = message.mentions.users.first();
      if (!user) {
        await message.channel.send(`\`\`\`\n❌ Usage: !${cmd} @user\n\`\`\``);
        return;
      }
      const textMap = {
        hug: `${message.author} hugs ${user}!`,
        slap: `${message.author} slaps ${user}!`,
        kiss: `${message.author} kisses ${user}!`,
        kill: `💀 ${message.author.username} deleted ${user.username} from existence.`,
      };
      const colorMap = { hug: 0xff69b4, slap: 0xe74c3c, kiss: 0xff69b4, kill: 0x8b0000 };
      await message.channel.send({ embeds: [simpleEmbed(cmd.charAt(0).toUpperCase() + cmd.slice(1), textMap[cmd], colorMap[cmd])] });
      return;
    }

    if (cmd === "rate") {
      const thing = args.join(" ");
      if (!thing) {
        await message.channel.send("```\n❌ Usage: !rate <thing>\n```");
        return;
      }
      const rating = Math.floor(Math.random() * 11);
      await message.channel.send({ embeds: [simpleEmbed("⭐ Rating", `I rate **${thing}** a **${rating}/10**`, 0xf1c40f)] });
      return;
    }

    if (cmd === "ship") {
      const users = message.mentions.users.map((user) => user);
      const user1 = users[0];
      const user2 = users[1] ?? message.author;
      if (!user1) {
        await message.channel.send("```\n❌ Usage: !ship @user1 [@user2]\n```");
        return;
      }
      const seed = BigInt(user1.id) < BigInt(user2.id) ? `${user1.id}${user2.id}` : `${user2.id}${user1.id}`;
      let hash = 0;
      for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 101;
      const percent = hash;
      const bar = "█".repeat(Math.floor(percent / 10)) + "░".repeat(10 - Math.floor(percent / 10));
      await message.channel.send({ embeds: [new EmbedBuilder().setTitle("💘 Love Calculator").setColor(percent >= 60 ? 0xff69b4 : percent >= 40 ? 0xf1c40f : 0x95a5a6).addFields(
        { name: "Ship Name", value: `**${user1.username.slice(0, Math.floor(user1.username.length / 2))}${user2.username.slice(Math.floor(user2.username.length / 2))}**`, inline: false },
        { name: "Compatibility", value: `\`\`\`\n[${bar}] ${percent}%\n\`\`\``, inline: false },
      )] });
      return;
    }

    if (["iq", "pp", "gayrate", "simprate"].includes(cmd)) {
      const user = message.mentions.users.first() ?? message.author;
      if (cmd === "iq") {
        const iq = 1 + Math.floor(Math.random() * 200);
        await message.channel.send({ embeds: [simpleEmbed("🧠 IQ Test", `${user}'s IQ is **${iq}**`, 0x3498db).setThumbnail(user.displayAvatarURL())] });
      } else if (cmd === "pp") {
        const size = 1 + Math.floor(Math.random() * 15);
        await message.channel.send({ embeds: [simpleEmbed("📏 PP Size Machine", `${user}'s PP:\n\`\`\`\n8${"=".repeat(size)}D\n\`\`\``, 0x3498db)] });
      } else if (cmd === "gayrate") {
        const percent = Math.floor(Math.random() * 101);
        await message.channel.send({ embeds: [simpleEmbed("🏳️‍🌈 Gay Rate", `${user} is **${percent}%** gay!`, 0xff00ff)] });
      } else {
        const percent = Math.floor(Math.random() * 101);
        await message.channel.send({ embeds: [simpleEmbed("💖 Simp Rate", `${user} is **${percent}%** simp!`, 0xff69b4)] });
      }
      return;
    }

    if (cmd === "hack") {
      const user = message.mentions.users.first();
      if (!user) {
        await message.channel.send("```\n❌ Usage: !hack @user\n```");
        return;
      }
      const progress = await message.channel.send({ embeds: [simpleEmbed("💻 Hacking in progress...", "```\nConnecting to target...\n```", 0x145a32)] });
      const steps = ["Bypassing firewall...", "Accessing mainframe...", "Downloading data...", "Retrieving passwords...", "Hacking complete!"];
      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        await progress.edit({ embeds: [simpleEmbed("💻 Hacking in progress...", `\`\`\`\n${step}\n\`\`\``, 0x145a32)] });
      }
      const fakePassword = Math.random().toString(36).slice(2, 14);
      await progress.edit({ embeds: [new EmbedBuilder().setTitle(`💻 Hacked ${user.username}!`).setColor(0x2ecc71).addFields({
        name: "Retrieved Data",
        value: `\`\`\`yaml\nEmail: ${user.username.toLowerCase()}@gmail.com\nPassword: ${fakePassword}\nIP: 192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}\nLast Location: Mom's Basement\n\`\`\``,
        inline: false,
      }).setFooter({ text: "Just kidding! This is fake" })] });
      return;
    }

    if (cmd === "meme") {
      try {
        const response = await fetch("https://meme-api.com/gimme");
        const data = await response.json();
        await message.channel.send({ embeds: [new EmbedBuilder().setTitle(data.title || "Meme").setColor(0x3498db).setImage(data.url).setFooter({ text: `👍 ${data.ups || 0} | r/${data.subreddit || "memes"}` })] });
      } catch {
        await message.channel.send("```\n❌ Failed to fetch meme!\n```");
      }
      return;
    }

    if (cmd === "joke" || cmd === "fact") {
      const list = cmd === "joke" ? jokes : facts;
      const title = cmd === "joke" ? "😂 Random Joke" : "🧠 Random Fact";
      const color = cmd === "joke" ? 0xf1c40f : 0x3498db;
      await message.channel.send({ embeds: [simpleEmbed(title, pick(list), color)] });
      return;
    }

    if (cmd === "quote") {
      const [quote, author] = pick(quotes);
      await message.channel.send({ embeds: [simpleEmbed("💭 Inspirational Quote", `*"${quote}"*\n\n— **${author}**`, 0x9b59b6)] });
      return;
    }

    if (cmd === "wouldyourather" || cmd === "wyr") {
      const [a, b] = pick([["be able to fly", "be invisible"], ["have unlimited money", "unlimited knowledge"], ["be famous", "be rich"]]);
      await message.channel.send({ embeds: [simpleEmbed("🤔 Would You Rather...", `**A:** ${a}\n\n**OR**\n\n**B:** ${b}`, 0x9b59b6)] });
      return;
    }

    if (cmd === "truth" || cmd === "dare") {
      const item = cmd === "truth" ? pick(truths) : pick(dares);
      await message.channel.send({ embeds: [simpleEmbed(cmd === "truth" ? "🎯 Truth" : "😈 Dare", item, cmd === "truth" ? 0x3498db : 0xe74c3c)] });
      return;
    }

    if (cmd === "neverhaveiever" || cmd === "nhie") {
      const item = pick([
        "Never have I ever lied about my age",
        "Never have I ever broken a bone",
        "Never have I ever met a celebrity",
      ]);
      await message.channel.send({ embeds: [simpleEmbed("🙊 Never Have I Ever", item, 0xe67e22)] });
      return;
    }

    if (cmd === "thisorthat" || cmd === "tot") {
      const [a, b] = pick([["Dogs", "Cats"], ["Summer", "Winter"], ["Coffee", "Tea"]]);
      await message.channel.send({ embeds: [simpleEmbed("🔀 This or That?", `**A** ${a}\n\nVS\n\n**B** ${b}`, 0x1abc9c)] });
      return;
    }

    if (cmd === "trivia") {
      await askTrivia(message, pick(triviaQuestions));
      return;
    }

    if (cmd === "riddle") {
      const item = pick(riddles);
      const prompt = await message.channel.send({ embeds: [simpleEmbed("🧩 Riddle Me This!", item.riddle, 0x9b59b6).setFooter({ text: "Reply with the answer within 60 seconds." })] });
      const collected = await message.channel.awaitMessages({
        filter: (m) => m.author.id === message.author.id,
        max: 1,
        time: 60000,
      });
      if (!collected.size) {
        await message.channel.send(`\`\`\`\n⏰ Time's up! The answer was: ${item.answer}\n\`\`\``);
        return;
      }
      const answer = collected.first().content.toLowerCase().trim();
      await message.channel.send(answer === item.answer.toLowerCase() ? { embeds: [simpleEmbed("🧩 Answer", `**${item.answer}**`, 0x2ecc71)] } : `\`\`\`\n❌ Wrong! The answer was: ${item.answer}\n\`\`\``);
      await prompt.react("🔍").catch(() => {});
    }
  },
};
