import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

const STORE_ICON =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80";

function helpHome() {
  const embed = new EmbedBuilder()
    .setColor(0x00ff9d)
    .setTimestamp(new Date())
    .setAuthor({ name: "📚 ZERODAY TOOLS - COMMAND CENTER", iconURL: STORE_ICON })
    .setDescription(
      "```ansi\n" +
        "\u001b[1;36m╔═══════════════════════════════════════════════════╗\n" +
        "\u001b[1;36m║                                                   ║\n" +
        "\u001b[1;36m║        🤖  ADVANCED BOT COMMAND GUIDE  🤖        ║\n" +
        "\u001b[1;36m║                                                   ║\n" +
        "\u001b[1;36m╚═══════════════════════════════════════════════════╝\n" +
        "```\n" +
        "**Welcome to ZeroDay Tools Bot!**\n" +
        "Use the buttons below to browse command categories.\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    )
    .addFields(
      {
        name: "📋 **COMMAND CATEGORIES**",
        value:
          "> 🛒 **Shopping** - Products, orders, purchases\n" +
          "> 🎫 **Tickets** - Support & purchase tickets\n" +
          "> 🔨 **Moderation** - Server management tools\n" +
          "> 💰 **Economy** - Currency, shop, gambling\n" +
          "> 🎮 **Fun** - Games, memes, interactions\n" +
          "> 🖼️ **Image** - Avatar manipulation tools\n" +
          "> 🛠️ **Utility** - Helpful utility commands\n" +
          "> 📊 **Info** - User, server, bot information\n" +
          "> ⚙️ **Admin** - Administrator commands",
        inline: false,
      },
      {
        name: "",
        value:
          "```yaml\n" +
          "📊 BOT STATISTICS\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "Total Commands  : 120+\n" +
          "Categories      : 9\n" +
          "Prefix          : !\n" +
          "Help Version    : 2.0\n" +
          "```",
        inline: true,
      },
      {
        name: "",
        value:
          "```fix\n" +
          "💡 QUICK TIPS\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "• Use buttons to navigate\n" +
          "• <required> [optional]\n" +
          "• Don't type < > or [ ]\n" +
          "• Some cmds need permissions\n" +
          "```",
        inline: true,
      }
    )
    .setFooter({
      text: "ZeroDay Tools • Use buttons below to navigate • Page 1/10",
      iconURL: STORE_ICON,
    })
    .setThumbnail(STORE_ICON);
  return embed;
}

function simplePage(title, color, header, fields, footer) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTimestamp(new Date())
    .setAuthor({ name: title, iconURL: STORE_ICON })
    .setDescription(
      "```ansi\n" +
        header +
        "```\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );
  for (const field of fields) {
    embed.addFields(field);
  }
  embed.setFooter({ text: footer });
  return embed;
}

function helpShopping() {
  return simplePage(
    "🛒 SHOPPING COMMANDS",
    0x00d9ff,
    "\u001b[1;36m╔═══════════════════════════════════════════════════╗\n" +
      "\u001b[1;36m║           STOREFRONT & PRODUCT COMMANDS           ║\n" +
      "\u001b[1;36m╚═══════════════════════════════════════════════════╝\n",
    [
      {
        name: "🛍️ **Browsing**",
        value:
          "> `!products` - View all available products\n" +
          "> `!product <id>` - View specific product details\n" +
          "> `!cybersecurity` - Browse cybersecurity tools\n" +
          "> `!setup #channel` - Deploy storefront menu",
        inline: false,
      },
      {
        name: "🛒 **Purchasing**",
        value:
          "> `!buy <id>` - Purchase a product\n" +
          "> `!orders` - View your order history\n" +
          "> `!order <id>` - Check specific order status",
        inline: false,
      },
      {
        name: "📦 **Management** (Admin)",
        value:
          "> `!addproduct` - Add new product interactively\n" +
          "> `!removeproduct <id>` - Remove a product\n" +
          "> `!setstatus <order_id> <status>` - Update order\n" +
          "> `!stats` - View sales statistics",
        inline: false,
      },
    ],
    "ZeroDay Tools • Shopping Commands • Page 2/10"
  );
}

function helpTickets() {
  return simplePage(
    "🎫 TICKET COMMANDS",
    0x5865f2,
    "\u001b[1;35m╔═══════════════════════════════════════════════════╗\n" +
      "\u001b[1;35m║             SUPPORT & TICKET SYSTEM               ║\n" +
      "\u001b[1;35m╚═══════════════════════════════════════════════════╝\n",
    [
      {
        name: "🎟️ **User Commands**",
        value:
          "> `!ticket <reason>` - Create support ticket\n" +
          "> `!closeticket` - Close your current ticket\n" +
          "> `!mytickets` - View all your tickets",
        inline: false,
      },
      {
        name: "🔧 **Staff Commands**",
        value:
          "> `!add @user` - Add user to ticket\n" +
          "> `!remove @user` - Remove user from ticket\n" +
          "> `!rename <name>` - Rename ticket channel\n" +
          "> `!transcript` - Generate ticket transcript",
        inline: false,
      },
    ],
    "ZeroDay Tools • Ticket Commands • Page 3/10"
  );
}

function helpModeration() {
  return simplePage(
    "🔨 MODERATION COMMANDS",
    0xff0000,
    "\u001b[1;31m╔═══════════════════════════════════════════════════╗\n" +
      "\u001b[1;31m║           SERVER MODERATION TOOLKIT               ║\n" +
      "\u001b[1;31m╚═══════════════════════════════════════════════════╝\n",
    [
      {
        name: "Member Actions",
        value:
          "> `!kick @user [reason]`\n" +
          "> `!ban @user [reason]`\n" +
          "> `!unban <user_id>`\n" +
          "> `!softban @user`\n" +
          "> `!mute @user <time> [reason]`\n" +
          "> `!unmute @user`",
        inline: false,
      },
      {
        name: "Warnings",
        value:
          "> `!warn @user [reason]`\n" +
          "> `!warnings [@user]`\n" +
          "> `!clearwarns @user`\n" +
          "> `!modlogs @user`\n" +
          "> `!case <id>`\n" +
          "> `!editcase <id> <reason>`",
        inline: false,
      },
    ],
    "ZeroDay Tools • Moderation Commands"
  );
}

function helpEconomy() {
  return simplePage(
    "💰 ECONOMY COMMANDS",
    0xf1c40f,
    "\u001b[1;33m╔═══════════════════════════════════════════════════╗\n" +
      "\u001b[1;33m║              ECONOMY & CURRENCY SYSTEM            ║\n" +
      "\u001b[1;33m╚═══════════════════════════════════════════════════╝\n",
    [
      {
        name: "Balance & Rewards",
        value:
          "> `!balance [@user]`\n" +
          "> `!daily`\n" +
          "> `!weekly`\n" +
          "> `!work`\n" +
          "> `!crime`\n" +
          "> `!rob @user`",
        inline: false,
      },
      {
        name: "Banking & Shop",
        value:
          "> `!deposit <amount|all>`\n" +
          "> `!withdraw <amount|all>`\n" +
          "> `!pay @user <amount>`\n" +
          "> `!shop`\n" +
          "> `!buyitem <item_id>`\n" +
          "> `!inventory [@user]`",
        inline: false,
      },
    ],
    "ZeroDay Tools • Economy Commands"
  );
}

function helpUtility() {
  return simplePage(
    "🛠️ UTILITY COMMANDS",
    0x3498db,
    "\u001b[1;34m╔═══════════════════════════════════════════════════╗\n" +
      "\u001b[1;34m║                UTILITY TOOLKIT                    ║\n" +
      "\u001b[1;34m╚═══════════════════════════════════════════════════╝\n",
    [
      {
        name: "Utility",
        value:
          "> `!remind <time> <message>`\n" +
          "> `!calculate <expression>`\n" +
          "> `!qrcode <text>`\n" +
          "> `!password [length]`\n" +
          "> `!snipe`\n" +
          "> `!editsnipe`",
        inline: false,
      },
      {
        name: "Profile Tools",
        value:
          "> `!afk [reason]`\n" +
          "> `!av [@user]`\n" +
          "> `!hash <type> <text>`",
        inline: false,
      },
    ],
    "ZeroDay Tools • Utility Commands"
  );
}

function helpFun() {
  return simplePage(
    "🎮 FUN COMMANDS",
    0xff69b4,
    "\u001b[1;35m╔═══════════════════════════════════════════════════╗\n" +
      "\u001b[1;35m║              FUN & ENTERTAINMENT                  ║\n" +
      "\u001b[1;35m╚═══════════════════════════════════════════════════╝\n",
    [
      {
        name: "Games",
        value:
          "> `!8ball <question>`\n" +
          "> `!coinflip`\n" +
          "> `!roll <dice>`\n" +
          "> `!rps <choice>`\n" +
          "> `!fight @user`\n" +
          "> `!trivia`\n" +
          "> `!riddle`",
        inline: false,
      },
      {
        name: "Social & Content",
        value:
          "> `!roast @user`\n" +
          "> `!compliment @user`\n" +
          "> `!hug @user`\n" +
          "> `!ship @user1 @user2`\n" +
          "> `!meme`\n" +
          "> `!joke`\n" +
          "> `!fact`\n" +
          "> `!quote`",
        inline: false,
      },
    ],
    "ZeroDay Tools • Fun Commands"
  );
}

function helpImage() {
  return simplePage(
    "🖼️ IMAGE COMMANDS",
    0x9b59b6,
    "\u001b[1;35m╔═══════════════════════════════════════════════════╗\n" +
      "\u001b[1;35m║            IMAGE MANIPULATION SUITE               ║\n" +
      "\u001b[1;35m╚═══════════════════════════════════════════════════╝\n",
    [
      {
        name: "Filters",
        value:
          "> `!blur [@user]`\n" +
          "> `!pixelate [@user]`\n" +
          "> `!deepfry [@user]`\n" +
          "> `!invert [@user]`\n" +
          "> `!grayscale [@user]`\n" +
          "> `!sepia [@user]`",
        inline: false,
      },
      {
        name: "Adjustments & Posters",
        value:
          "> `!brightness [@user] <value>`\n" +
          "> `!contrast [@user] <value>`\n" +
          "> `!rotate [@user] <degrees>`\n" +
          "> `!flipavatar [@user]`\n" +
          "> `!mirror [@user]`\n" +
          "> `!resize [@user] <w> <h>`\n" +
          "> `!wanted [@user]`\n" +
          "> `!jail [@user]`",
        inline: false,
      },
    ],
    "ZeroDay Tools • Image Commands"
  );
}

function helpInfo() {
  return simplePage(
    "📊 INFORMATION COMMANDS",
    0x2ecc71,
    "\u001b[1;32m╔═══════════════════════════════════════════════════╗\n" +
      "\u001b[1;32m║              INFORMATION & LOOKUP                 ║\n" +
      "\u001b[1;32m╚═══════════════════════════════════════════════════╝\n",
    [
      {
        name: "Profile Information",
        value:
          "> `!userinfo [@user]`\n" +
          "> `!av [@user]`\n" +
          "> `!banner [@user]`\n" +
          "> `!ping`",
        inline: false,
      },
    ],
    "ZeroDay Tools • Info Commands"
  );
}

function helpAdmin() {
  return simplePage(
    "⚙️ ADMIN COMMANDS",
    0xe74c3c,
    "\u001b[1;31m╔═══════════════════════════════════════════════════╗\n" +
      "\u001b[1;31m║              ADMINISTRATOR CONTROLS               ║\n" +
      "\u001b[1;31m╚═══════════════════════════════════════════════════╝\n",
    [
      {
        name: "Server Setup",
        value:
          "> `!setup #channel`\n" +
          "> `!setchannel <type> #channel`\n" +
          "> `!postrules`\n" +
          "> `!welcome #channel`\n" +
          "> `!setwelcomestyle <style>`\n" +
          "> `!testwelcome`\n" +
          "> `!disablewelcome`",
        inline: false,
      },
    ],
    "ZeroDay Tools • Admin Commands"
  );
}

const pages = {
  home: helpHome,
  shopping: helpShopping,
  tickets: helpTickets,
  moderation: helpModeration,
  economy: helpEconomy,
  fun: helpFun,
  image: helpImage,
  utility: helpUtility,
  info: helpInfo,
  admin: helpAdmin,
};

function buildButtons() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("help_home").setLabel("Home").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("help_shop").setLabel("Shop").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("help_tickets").setLabel("Tickets").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("help_mod").setLabel("Mod").setStyle(ButtonStyle.Danger)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("help_eco").setLabel("Economy").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("help_fun").setLabel("Fun").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("help_image").setLabel("Image").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("help_util").setLabel("Utility").setStyle(ButtonStyle.Secondary)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("help_info").setLabel("Info").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("help_admin").setLabel("Admin").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("help_close").setLabel("Close").setStyle(ButtonStyle.Secondary)
    ),
  ];
}

export const command = {
  name: "help",
  aliases: ["h", "commands", "cmds"],
  async execute({ message, args }) {
    const category = args[0]?.toLowerCase();
    const map = {
      shop: "shopping",
      shopping: "shopping",
      products: "shopping",
      ticket: "tickets",
      tickets: "tickets",
      mod: "moderation",
      moderation: "moderation",
      economy: "economy",
      eco: "economy",
      fun: "fun",
      image: "image",
      img: "image",
      utility: "utility",
      util: "utility",
      info: "info",
      admin: "admin",
    };
    const page = category ? map[category] : "home";
    const embedFn = pages[page] ?? pages.home;
    const msg = await message.channel.send({ embeds: [embedFn()], components: buildButtons() });

    const collector = msg.createMessageComponentCollector({ time: 300_000 });
    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        await interaction.reply({ content: "```\\n❌ Only the command user can use these buttons.\\n```", ephemeral: true });
        return;
      }
      if (interaction.customId === "help_close") {
        await interaction.message.delete().catch(() => {});
        return;
      }
      const next =
        interaction.customId === "help_home"
          ? "home"
          : interaction.customId === "help_shop"
          ? "shopping"
          : interaction.customId === "help_tickets"
          ? "tickets"
          : interaction.customId === "help_mod"
          ? "moderation"
          : interaction.customId === "help_eco"
          ? "economy"
          : interaction.customId === "help_fun"
          ? "fun"
          : interaction.customId === "help_image"
          ? "image"
          : interaction.customId === "help_util"
          ? "utility"
          : interaction.customId === "help_info"
          ? "info"
          : interaction.customId === "help_admin"
          ? "admin"
          : "home";
      await interaction.update({ embeds: [pages[next]()], components: buildButtons() });
    });
  },
};
