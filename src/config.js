import fs from "node:fs";

const DEFAULT_CONFIG = {
  prefix: "!",
  sales_channel: null,
  ticket_category: null,
  admin_roles: [],
  support_roles: [],
  log_channel: null,
  payment_methods: ["PayPal", "Bitcoin", "Ethereum", "Bank Transfer"],
  embed_color: "0x00ff9d",
  footer_text: "ZeroDay Tools",
  thumbnail_url: "https://i.imgur.com/your_logo.png",
  rules_message_id: null,
  rules_channel: null,
  welcome_channel: null,
  welcome_style: "main",
  lavalink_nodes: [],
  noprefix_users: [],
};

export function loadConfig() {
  try {
    if (!fs.existsSync("config.json")) {
      fs.writeFileSync("config.json", JSON.stringify({ guilds: {} }, null, 4));
    }
    const raw = fs.readFileSync("config.json", "utf8");
    const config = JSON.parse(raw);
    if (!config.guilds) config.guilds = {};
    return config;
  } catch (err) {
    return { guilds: {} };
  }
}

export function getGuildConfig(guildId) {
  const config = loadConfig();
  return { ...DEFAULT_CONFIG, ...(config.guilds[guildId] || {}) };
}

export function saveGuildConfig(guildId, guildConfig) {
  const config = loadConfig();
  config.guilds[guildId] = guildConfig;
  fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
}

export function saveConfig(config) {
  // Legacy support or for global settings if we decide to use it that way
  fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
}
