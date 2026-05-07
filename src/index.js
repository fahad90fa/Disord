import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import { loadConfig, getGuildConfig } from "./config.js";
import { setupLavalink } from "./lavalink.js";

const config = loadConfig();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.Message],
});

client.commands = new Collection();
client.commandModules = [];

const commandsPath = path.join(process.cwd(), "src", "commands");
if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));
  for (const file of files) {
    const mod = await import(path.join(commandsPath, file));
    client.commandModules.push(mod);
    if (mod?.command?.name) {
      client.commands.set(mod.command.name, mod.command);
      if (mod.command.aliases) {
        for (const alias of mod.command.aliases) {
          client.commands.set(alias, mod.command);
        }
      }
    }
  }
}

client.once("clientReady", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  await setupLavalink(client, config);
  for (const mod of client.commandModules) {
    if (typeof mod.register === "function") {
      await mod.register(client);
    }
  }
});

client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const guildConfig = getGuildConfig(message.guild.id);
  const hasPrefix = message.content.startsWith(guildConfig.prefix);
  const isNoPrefixUser = guildConfig.noprefix_users?.includes(message.author.id);

  if (!hasPrefix && !isNoPrefixUser) return;

  const content = hasPrefix ? message.content.slice(guildConfig.prefix.length) : message.content;
  const args = content.trim().split(/\s+/);
  const name = args.shift()?.toLowerCase();
  if (!name) return;

  const command = client.commands.get(name);
  if (!command) return;

  try {
    await command.execute({ client, message, args, config: guildConfig, cmd: name });
  } catch (err) {
    console.error(err);
    await message.channel.send("```\n❌ Command failed. Check logs.\n```");
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.guild) return;
  const guildConfig = getGuildConfig(interaction.guild.id);
  for (const mod of client.commandModules) {
    if (typeof mod.handleInteraction === "function") {
      const handled = await mod.handleInteraction({ client, interaction, config: guildConfig });
      if (handled) {
        return;
      }
    }
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error("DISCORD_TOKEN is not set.");
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

async function shutdown(signal) {
  console.warn(`Received ${signal}, shutting down bot gracefully...`);
  try {
    await client.destroy();
  } catch (error) {
    console.error("Error while destroying client:", error);
  } finally {
    process.exit(0);
  }
}

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

client.login(token);
