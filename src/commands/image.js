import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import sharp from "sharp";

async function fetchAvatarBuffer(user) {
  const url = user.displayAvatarURL({ extension: "png", size: 512 });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch avatar.");
  }
  return Buffer.from(await response.arrayBuffer());
}

async function getTargetUser(message) {
  return message.mentions.users.first() ?? message.author;
}

function parseAmount(raw, fallback) {
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

async function pixelate(buffer) {
  const base = sharp(buffer);
  const meta = await base.metadata();
  const width = meta.width ?? 512;
  const height = meta.height ?? 512;
  return base
    .resize(32, 32, { fit: "fill" })
    .resize(width, height, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
}

async function createPoster(buffer, type) {
  const avatar = await sharp(buffer).resize(360, 360).png().toBuffer();
  const svg = {
    wanted: `
      <svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#d7bf8b"/>
        <rect x="24" y="24" width="752" height="952" fill="none" stroke="#5a3a1a" stroke-width="14"/>
        <text x="400" y="130" font-size="90" text-anchor="middle" fill="#3d2208" font-family="Georgia">WANTED</text>
        <text x="400" y="210" font-size="34" text-anchor="middle" fill="#3d2208" font-family="Georgia">DEAD OR ALIVE</text>
        <rect x="220" y="260" width="360" height="360" fill="#f5ead1" stroke="#5a3a1a" stroke-width="8"/>
        <text x="400" y="820" font-size="54" text-anchor="middle" fill="#3d2208" font-family="Georgia">ZERO DAY OUTLAW</text>
        <text x="400" y="900" font-size="34" text-anchor="middle" fill="#3d2208" font-family="Georgia">$1,000,000 REWARD</text>
      </svg>`,
    jail: `
      <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1b1b1b"/>
        <rect x="70" y="70" width="660" height="660" rx="24" fill="none" stroke="#555" stroke-width="8"/>
        ${Array.from({ length: 8 }, (_, i) => `<rect x="${120 + i * 70}" y="60" width="28" height="680" fill="#a6a6a6"/>`).join("")}
        <text x="400" y="770" font-size="72" text-anchor="middle" fill="#ffffff" font-family="Arial">JAILED</text>
      </svg>`,
    rip: `
      <svg width="800" height="900" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#2c2c2c"/>
        <ellipse cx="400" cy="850" rx="250" ry="35" fill="#1f1f1f"/>
        <path d="M230 180 Q400 40 570 180 L570 760 L230 760 Z" fill="#7a7a7a" stroke="#595959" stroke-width="10"/>
        <text x="400" y="180" font-size="74" text-anchor="middle" fill="#1f1f1f" font-family="Georgia">RIP</text>
        <text x="400" y="725" font-size="42" text-anchor="middle" fill="#1f1f1f" font-family="Georgia">Gone But Pinged</text>
      </svg>`,
    trash: `
      <svg width="800" height="900" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#dce3e6"/>
        <rect x="210" y="260" width="380" height="500" rx="24" fill="#7d8a91"/>
        <rect x="180" y="210" width="440" height="65" rx="14" fill="#5b666c"/>
        <rect x="330" y="150" width="140" height="40" rx="18" fill="#5b666c"/>
        ${Array.from({ length: 5 }, (_, i) => `<rect x="${280 + i * 55}" y="320" width="18" height="360" fill="#c7d0d5"/>`).join("")}
        <text x="400" y="845" font-size="62" text-anchor="middle" fill="#465056" font-family="Arial">TRASH</text>
      </svg>`,
    triggered: `
      <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="rgba(255,0,0,0.22)"/>
        <rect x="0" y="620" width="800" height="180" fill="#b40000"/>
        <text x="400" y="735" font-size="110" text-anchor="middle" fill="#ffffff" font-family="Arial Black">TRIGGERED</text>
      </svg>`,
  }[type];

  const base = sharp({
    create: {
      width: 800,
      height: type === "rip" || type === "trash" ? 900 : 800,
      channels: 4,
      background: "#ffffff",
    },
  });

  const composites = [{ input: Buffer.from(svg), top: 0, left: 0 }];
  const positions = {
    wanted: { left: 220, top: 260 },
    jail: { left: 220, top: 220 },
    rip: { left: 220, top: 260 },
    trash: { left: 220, top: 330 },
    triggered: { left: 220, top: 140 },
  };
  if (type === "triggered") {
    const tinted = await sharp(buffer).resize(360, 360).modulate({ saturation: 2 }).tint("#ff3b30").png().toBuffer();
    composites.unshift({ input: tinted, ...positions[type] });
  } else {
    composites.unshift({ input: avatar, ...positions[type] });
  }

  if (type === "jail") {
    return base.composite(composites).png().toBuffer();
  }
  if (type === "rip") {
    const circle = await sharp(avatar).composite([{ input: Buffer.from(`<svg width="360" height="360"><circle cx="180" cy="180" r="174" fill="none" stroke="#595959" stroke-width="10"/></svg>`), top: 0, left: 0 }]).png().toBuffer();
    composites[0] = { input: circle, ...positions[type] };
  }
  return base.composite(composites).png().toBuffer();
}

async function buildImage(commandName, buffer, args) {
  if (commandName === "blur") return sharp(buffer).blur(6).png().toBuffer();
  if (commandName === "pixelate") return pixelate(buffer);
  if (commandName === "deepfry") return sharp(buffer).modulate({ saturation: 2.2, brightness: 1.25 }).sharpen({ sigma: 2 }).jpeg({ quality: 35 }).png().toBuffer();
  if (commandName === "invert") return sharp(buffer).negate().png().toBuffer();
  if (commandName === "grayscale") return sharp(buffer).grayscale().png().toBuffer();
  if (commandName === "sepia") {
    return sharp(buffer).recomb([
      [0.393, 0.769, 0.189],
      [0.349, 0.686, 0.168],
      [0.272, 0.534, 0.131],
    ]).png().toBuffer();
  }
  if (commandName === "brightness") {
    const value = Math.min(3, Math.max(0.1, parseAmount(args.at(-1), 1)));
    return sharp(buffer).modulate({ brightness: value }).png().toBuffer();
  }
  if (commandName === "contrast") {
    const value = Math.min(3, Math.max(0.1, parseAmount(args.at(-1), 1)));
    return sharp(buffer).linear(value, -(128 * value) + 128).png().toBuffer();
  }
  if (commandName === "rotate") return sharp(buffer).rotate(parseAmount(args.at(-1), 90)).png().toBuffer();
  if (commandName === "flipavatar" || commandName === "vflip") return sharp(buffer).flip().png().toBuffer();
  if (commandName === "mirror") return sharp(buffer).flop().png().toBuffer();
  if (commandName === "resize") {
    const dims = args.slice(-2).map((part) => Number(part));
    if (!dims[0] || !dims[1]) {
      throw new Error("Usage: !resize [@user] <width> <height>");
    }
    return sharp(buffer).resize(dims[0], dims[1], { fit: "fill" }).png().toBuffer();
  }
  if (["wanted", "jail", "rip", "trash", "triggered"].includes(commandName)) {
    return createPoster(buffer, commandName);
  }
  throw new Error("Unsupported image command.");
}

export const command = {
  name: "blur",
  aliases: [
    "pixelate",
    "deepfry",
    "invert",
    "grayscale",
    "sepia",
    "brightness",
    "contrast",
    "rotate",
    "flipavatar",
    "vflip",
    "mirror",
    "resize",
    "wanted",
    "jail",
    "rip",
    "triggered",
    "trash",
  ],
  async execute({ message, args, config, cmd }) {
    try {
      const target = await getTargetUser(message);
      const buffer = await fetchAvatarBuffer(target);
      const output = await buildImage(cmd, buffer, args);
      const attachment = new AttachmentBuilder(output, { name: `${cmd}.png` });
      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0x9b59b6)
            .setTitle(`🖼️ ${cmd.toUpperCase()} Effect`)
            .setDescription(`Generated for ${target}`)
            .setImage(`attachment://${cmd}.png`)
            .setFooter({ text: `Requested by ${message.author.username}` }),
        ],
        files: [attachment],
      });
    } catch (error) {
      await message.channel.send(`\`\`\`\n❌ ${error.message}\n\`\`\``);
    }
  },
};
