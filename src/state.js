import fs from "node:fs";
import path from "node:path";

const dbDir = path.join(process.cwd(), "database");
const files = {
  economy: path.join(dbDir, "economy.json"),
  giveaways: path.join(dbDir, "giveaways.json"),
  modCases: path.join(dbDir, "mod_cases.json"),
  warnings: path.join(dbDir, "warnings.json"),
  reminders: path.join(dbDir, "reminders.json"),
  todos: path.join(dbDir, "todos.json"),
  afk: path.join(dbDir, "afk_users.json"),
};

const defaults = {
  [files.economy]: {},
  [files.giveaways]: { active: {}, history: [] },
  [files.modCases]: {},
  [files.warnings]: {},
  [files.reminders]: {},
  [files.todos]: {},
  [files.afk]: {},
};

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

for (const [file, fallback] of Object.entries(defaults)) {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 4));
  }
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    const fallback = defaults[file] ?? {};
    fs.writeFileSync(file, JSON.stringify(fallback, null, 4));
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 4));
}

const defaultEconomy = () => ({
  wallet: 0,
  bank: 0,
  inventory: [],
  last_daily: null,
  last_weekly: null,
  last_work: null,
  last_crime: null,
  last_rob: null,
});

export function getEconomyData() {
  return readJson(files.economy);
}

export function saveEconomyData(data) {
  writeJson(files.economy, data);
}

export function getGiveawaysData() {
  return readJson(files.giveaways);
}

export function saveGiveawaysData(data) {
  writeJson(files.giveaways, data);
}

export function getUserEconomy(userId) {
  const data = getEconomyData();
  const key = String(userId);
  if (!data[key]) {
    data[key] = defaultEconomy();
    saveEconomyData(data);
  }
  return data[key];
}

export function updateUserEconomy(userId, updater) {
  const data = getEconomyData();
  const key = String(userId);
  if (!data[key]) {
    data[key] = defaultEconomy();
  }
  updater(data[key], data);
  saveEconomyData(data);
  return data[key];
}

export function deleteUserEconomy(userId) {
  const data = getEconomyData();
  delete data[String(userId)];
  saveEconomyData(data);
}

export function getModCases() {
  return readJson(files.modCases);
}

export function saveModCases(data) {
  writeJson(files.modCases, data);
}

export function addModCase(guildId, entry) {
  const data = getModCases();
  const key = String(guildId);
  if (!data[key]) {
    data[key] = [];
  }
  const caseEntry = {
    case_id: data[key].length + 1,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  data[key].push(caseEntry);
  saveModCases(data);
  return caseEntry;
}

export function getWarnings() {
  return readJson(files.warnings);
}

export function saveWarnings(data) {
  writeJson(files.warnings, data);
}

export function addWarning(guildId, userId, entry) {
  const data = getWarnings();
  const guildKey = String(guildId);
  const userKey = String(userId);
  if (!data[guildKey]) {
    data[guildKey] = {};
  }
  if (!data[guildKey][userKey]) {
    data[guildKey][userKey] = [];
  }
  const warning = {
    id: data[guildKey][userKey].length + 1,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  data[guildKey][userKey].push(warning);
  saveWarnings(data);
  return warning;
}

export function getReminders() {
  return readJson(files.reminders);
}

export function saveReminders(data) {
  writeJson(files.reminders, data);
}

export function getAfkData() {
  return readJson(files.afk);
}

export function saveAfkData(data) {
  writeJson(files.afk, data);
}
