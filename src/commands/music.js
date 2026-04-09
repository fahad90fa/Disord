import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

const controlState = new Map();
const autoplayState = new Map();
const lastTrackTitle = new Map();

function isTimeoutError(error) {
  const text = String(error?.message || error || "").toLowerCase();
  return text.includes("timeout") || text.includes("aborted");
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return "Unknown";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function progressBar(positionMs, durationMs, size = 16) {
  if (!Number.isFinite(positionMs) || !Number.isFinite(durationMs) || durationMs <= 0) {
    return "───────────────";
  }
  const ratio = clamp(positionMs / durationMs, 0, 1);
  const filled = Math.round(ratio * size);
  const empty = Math.max(0, size - filled);
  return `${"█".repeat(filled)}${"░".repeat(empty)}`;
}

function buildButtons(player) {
  const autoplayOn = autoplayState.get(player.guildId) === true;
  const loopMode = String(player.repeatMode || "off");
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("music_playpause").setLabel("Play/Pause").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("music_skip").setLabel("Skip").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("music_stop").setLabel("Stop").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("music_loop").setLabel(`Loop: ${loopMode}`).setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("music_shuffle").setLabel("Shuffle").setStyle(ButtonStyle.Secondary)
    ),
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("music_voldown").setLabel("Vol -").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("music_volup").setLabel("Vol +").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("music_queue").setLabel("Queue").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("music_autoplay").setLabel(autoplayOn ? "Autoplay: On" : "Autoplay: Off").setStyle(autoplayOn ? ButtonStyle.Success : ButtonStyle.Secondary)
    ),
  ];
}

function buildNowPlayingEmbed(player) {
  const embed = new EmbedBuilder()
    .setTitle("Music Control Center")
    .setColor(0x00ff9d)
    .setTimestamp(new Date());

  const track = player.queue.current;
  if (!track) {
    embed.setDescription("No track is currently playing.");
    return embed;
  }

  const title = String(track.title || track.info?.title || "Unknown Track");
  const duration = formatDuration(track.duration ?? track.info?.duration ?? track.info?.length);
  const volume = Number.isFinite(player.volume) ? `${player.volume}%` : "Unknown";
  const loopMode = String(player.repeatMode || "off");
  const position = formatDuration(player.position ?? 0);
  const bar = progressBar(player.position ?? 0, track.duration ?? track.info?.duration ?? track.info?.length);
  const autoplayOn = autoplayState.get(player.guildId) === true;
  const source = String(track.info?.sourceName || "unknown");
  const artwork = track.info?.artworkUrl || track.info?.thumbnail || null;

  embed.addFields(
    { name: "Now Playing", value: title, inline: false },
    { name: "Progress", value: `${position} / ${duration}\n${bar}`, inline: false },
    { name: "Volume", value: volume, inline: true },
    { name: "Loop", value: loopMode, inline: true },
    { name: "Autoplay", value: autoplayOn ? "On" : "Off", inline: true },
    { name: "Source", value: source, inline: true }
  );

  if (track.requester?.id) {
    embed.addFields({ name: "Requested By", value: `<@${track.requester.id}>`, inline: true });
  }
  if (track.uri) {
    embed.addFields({ name: "Link", value: track.uri, inline: false });
  }
  if (artwork) {
    embed.setThumbnail(artwork);
  }
  return embed;
}

async function updateControlMessage(player) {
  const info = controlState.get(player.guildId);
  if (!info) return;
  const { channelId, messageId } = info;
  const channel = player.manager.client.channels.cache.get(channelId);
  if (!channel) return;
  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message) return;
  await message.edit({ embeds: [buildNowPlayingEmbed(player)], components: buildButtons(player) }).catch(() => {});
}

export const command = {
  name: "play",
  aliases: [
    "p",
    "join",
    "summon",
    "leave",
    "disconnect",
    "pause",
    "resume",
    "stop",
    "skip",
    "next",
    "nowplaying",
    "np",
    "queue",
    "q",
    "volume",
    "vol",
    "loop",
    "shuffle",
    "clearqueue",
    "clearq",
    "remove",
    "move",
    "nodes",
    "autoplay",
    "ap",
  ],
  async execute({ message, args, config }) {
    const client = message.client;
    const manager = client.lavalink;
    if (!manager || !manager.useable) {
      await message.channel.send("```\n❌ Lavalink is not ready yet.\n```");
      return;
    }

    const cmd = message.content.slice(config.prefix.length).trim().split(/\s+/)[0].toLowerCase();
    const voiceChannelId = message.member.voice?.channelId;

    const getPlayer = () =>
      manager.createPlayer({
        guildId: message.guild.id,
        voiceChannelId,
        textChannelId: message.channel.id,
        selfDeaf: true,
        volume: 100,
      });

    if (cmd === "join" || cmd === "summon") {
      if (!voiceChannelId) {
        await message.channel.send("```\n❌ Join a voice channel first.\n```");
        return;
      }
      const player = getPlayer();
      if (!player.connected) await player.connect();
      await message.channel.send("```\n✅ Connected.\n```");
      return;
    }

    if (cmd === "leave" || cmd === "disconnect") {
      const player = manager.getPlayer(message.guild.id);
      if (!player) {
        await message.channel.send("```\n❌ Not connected.\n```");
        return;
      }
      await player.destroy();
      await message.channel.send("```\n✅ Disconnected.\n```");
      return;
    }

    if (cmd === "play" || cmd === "p") {
      if (!voiceChannelId) {
        await message.channel.send("```\n❌ Join a voice channel first.\n```");
        return;
      }
      const query = args.join(" ");
      if (!query) {
        await message.channel.send("```\n❌ Usage: !play <song>\n```");
        return;
      }

      const player = getPlayer();
      if (!player.connected) await player.connect();
      const connectedNodes = Array.from(manager.nodeManager?.leastUsedNodes?.("playingPlayers") || [])
        .filter((node) => node?.connected)
        .map((node) => node.options.id);
      if (!connectedNodes.length) {
        await message.channel.send("```\n❌ No healthy Lavalink nodes are connected right now.\n```");
        return;
      }

      const orderedNodeIds = [
        player.node?.options?.id,
        ...connectedNodes.filter((id) => id !== player.node?.options?.id),
      ].filter(Boolean);

      let result = null;
      let lastError = null;
      for (const nodeId of orderedNodeIds) {
        try {
          if (player.node?.options?.id !== nodeId) {
            await player.moveNode(nodeId);
          }
          result = await player.search({ query }, message.author);
          if (result?.tracks?.length) break;
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!result) {
        if (isTimeoutError(lastError)) {
          await message.channel.send("```\n❌ Lavalink search timed out on all nodes. Try again in a few seconds.\n```");
        } else {
          await message.channel.send(`\`\`\`\n❌ Search failed: ${lastError?.message || "unknown error"}\n\`\`\``);
        }
        return;
      }

      if (!result.tracks?.length) {
        await message.channel.send("```\n❌ No results found.\n```");
        return;
      }

      if (result.loadType === "playlist") {
        await player.queue.add(result.tracks);
        await message.channel.send(`✅ Added playlist: ${result.playlist?.name ?? "Playlist"} (${result.tracks.length} tracks)`);
      } else {
        await player.queue.add(result.tracks[0]);
        await message.channel.send(`✅ Queued: ${result.tracks[0].title}`);
      }

      if (!player.playing && !player.paused && !player.queue.current) {
        await player.play();
      }

      if (!controlState.has(message.guild.id)) {
        const msg = await message.channel.send({
          embeds: [buildNowPlayingEmbed(player)],
          components: buildButtons(player),
        });
        controlState.set(message.guild.id, { channelId: msg.channel.id, messageId: msg.id });
      }
      return;
    }

    const player = manager.getPlayer(message.guild.id);
    if (!player) {
      await message.channel.send("```\n❌ Not connected.\n```");
      return;
    }

    if (cmd === "pause") {
      await player.pause();
      await message.channel.send("```\n⏸️ Paused.\n```");
      await updateControlMessage(player);
      return;
    }

    if (cmd === "resume") {
      await player.resume();
      await message.channel.send("```\n▶️ Resumed.\n```");
      await updateControlMessage(player);
      return;
    }

    if (cmd === "stop") {
      await player.stopPlaying(true, false);
      await message.channel.send("```\n⏹️ Stopped and cleared.\n```");
      await updateControlMessage(player);
      return;
    }

    if (cmd === "skip" || cmd === "next") {
      await player.skip();
      await message.channel.send("```\n⏭️ Skipped.\n```");
      return;
    }

    if (cmd === "nowplaying" || cmd === "np") {
      await message.channel.send({ embeds: [buildNowPlayingEmbed(player)] });
      return;
    }

    if (cmd === "queue" || cmd === "q") {
      const current = player.queue.current;
      const tracks = player.queue.tracks ?? [];
      const lines = [];
      if (current) lines.push(`Now: ${current.title}`);
      tracks.slice(0, 10).forEach((t, i) => lines.push(`${i + 1}. ${t.title}`));
      if (tracks.length > 10) lines.push(`...and ${tracks.length - 10} more`);
      await message.channel.send("```\n" + (lines.join("\n") || "Queue is empty.") + "\n```");
      return;
    }

    if (cmd === "volume" || cmd === "vol") {
      const vol = Number(args[0]);
      if (!vol || vol < 0 || vol > 200) {
        await message.channel.send("```\n❌ Usage: !volume <0-200>\n```");
        return;
      }
      await player.setVolume(vol);
      await updateControlMessage(player);
      await message.channel.send(`✅ Volume set to ${vol}%`);
      return;
    }

    if (cmd === "loop") {
      const mode = (args[0] || "off").toLowerCase();
      if (!["off", "track", "queue"].includes(mode)) {
        await message.channel.send("```\n❌ Usage: !loop off|track|queue\n```");
        return;
      }
      await player.setRepeatMode(mode);
      await updateControlMessage(player);
      await message.channel.send(`✅ Loop mode set to ${mode}`);
      return;
    }

    if (cmd === "shuffle") {
      await player.queue.shuffle();
      await message.channel.send("✅ Queue shuffled.");
      return;
    }

    if (cmd === "clearqueue" || cmd === "clearq") {
      if (player.queue.tracks.length) {
        await player.queue.splice(0, player.queue.tracks.length);
      }
      await message.channel.send("✅ Queue cleared.");
      return;
    }

    if (cmd === "remove") {
      const index = Number(args[0]);
      if (!index) {
        await message.channel.send("```\n❌ Usage: !remove <index>\n```");
        return;
      }
      const removed = await player.queue.remove(index - 1);
      if (!removed?.removed?.length) {
        await message.channel.send("```\n❌ Invalid index.\n```");
        return;
      }
      await message.channel.send(`✅ Removed: ${removed.removed[0]?.title ?? "Track"}`);
      return;
    }

    if (cmd === "move") {
      const from = Number(args[0]);
      const to = Number(args[1]);
      if (!from || !to) {
        await message.channel.send("```\n❌ Usage: !move <from> <to>\n```");
        return;
      }
      const fromIndex = from - 1;
      const toIndex = to - 1;
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= player.queue.tracks.length ||
        toIndex >= player.queue.tracks.length
      ) {
        await message.channel.send("```\n❌ Invalid positions.\n```");
        return;
      }
      const extracted = await player.queue.splice(fromIndex, 1);
      const track = Array.isArray(extracted) ? extracted[0] : extracted;
      if (!track) {
        await message.channel.send("```\n❌ Failed to move track.\n```");
        return;
      }
      await player.queue.add(track, toIndex);
      await message.channel.send(`✅ Moved track to position ${to}`);
      return;
    }

    if (cmd === "nodes") {
      const nodes = manager.nodeManager?.nodes ?? [];
      if (!nodes.length) {
        await message.channel.send("```\n❌ No Lavalink nodes connected.\n```");
        return;
      }
      const lines = nodes.map((n) => `${n.options.id} | ${n.options.host}:${n.options.port} | connected=${n.connected}`);
      await message.channel.send("```\n" + lines.join("\n") + "\n```");
      return;
    }

    if (cmd === "autoplay" || cmd === "ap") {
      const current = autoplayState.get(message.guild.id) === true;
      autoplayState.set(message.guild.id, !current);
      await updateControlMessage(player);
      await message.channel.send(`✅ Autoplay ${!current ? "enabled" : "disabled"}.`);
    }
  },
};

export async function register(client) {
  const manager = client.lavalink;
  if (!manager) return;

  manager.on("trackStart", async (player) => {
    if (player.queue.current?.title || player.queue.current?.info?.title) {
      lastTrackTitle.set(player.guildId, String(player.queue.current?.title || player.queue.current?.info?.title));
    }
    await updateControlMessage(player);
  });

  manager.on("trackEnd", async (player) => {
    await updateControlMessage(player);
  });

  manager.on("queueEnd", async (player) => {
    if (autoplayState.get(player.guildId) === true) {
      const query = lastTrackTitle.get(player.guildId);
      if (query) {
        try {
          const result = await player.search({ query }, player.queue.current?.requester ?? null);
          if (result?.tracks?.length) {
            await player.queue.add(result.tracks[0]);
            if (!player.playing && !player.paused) {
              await player.play();
            }
          }
        } catch {
        }
      }
    }
    await updateControlMessage(player);
  });

  manager.on("trackError", async (player) => {
    await updateControlMessage(player);
  });
}

export async function handleInteraction({ client, interaction }) {
  if (!interaction.isButton() || !interaction.customId.startsWith("music_")) {
    return false;
  }

  const player = client.lavalink?.getPlayer(interaction.guildId);
  if (!player) {
    await interaction.reply({ content: "```\n❌ Music player is not active.\n```", ephemeral: true });
    return true;
  }

  if (interaction.member?.voice?.channelId !== player.voiceChannelId) {
    await interaction.reply({ content: "```\n❌ Join the same voice channel as the bot.\n```", ephemeral: true });
    return true;
  }

  const action = interaction.customId;
  if (action === "music_queue") {
    const current = player.queue.current;
    const tracks = player.queue.tracks ?? [];
    const lines = [];
    if (current) lines.push(`Now: ${current.title}`);
    tracks.slice(0, 10).forEach((track, index) => lines.push(`${index + 1}. ${track.title}`));
    if (tracks.length > 10) lines.push(`...and ${tracks.length - 10} more`);
    await interaction.reply({ content: "```\n" + (lines.join("\n") || "Queue is empty.") + "\n```", ephemeral: true });
    return true;
  }

  await interaction.deferUpdate();

  if (action === "music_playpause") {
    if (player.paused) await player.resume();
    else await player.pause();
  } else if (action === "music_skip") {
    await player.skip();
  } else if (action === "music_stop") {
    await player.stopPlaying(true, false);
  } else if (action === "music_loop") {
    const current = player.repeatMode ?? "off";
    const next = current === "off" ? "track" : current === "track" ? "queue" : "off";
    await player.setRepeatMode(next);
  } else if (action === "music_shuffle") {
    await player.queue.shuffle();
  } else if (action === "music_autoplay") {
    const current = autoplayState.get(interaction.guildId) === true;
    autoplayState.set(interaction.guildId, !current);
  } else if (action === "music_voldown") {
    await player.setVolume(Math.max(0, player.volume - 10));
  } else if (action === "music_volup") {
    await player.setVolume(Math.min(200, player.volume + 10));
  }

  await updateControlMessage(player);
  return true;
}
