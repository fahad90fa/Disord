import { PermissionsBitField } from "discord.js";

export const command = {
  name: "sync",
  aliases: ["syncperms", "transferperms"],
  async execute({ message, args, config }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.channel.send("```\n❌ You need Administrator permission.\n```");
      return;
    }

    const sourceId = "1498784673365757962";
    const targetIds = [
      "1498784682161213522",
      "1498784686208585890",
      "1498784687601090580",
      "1498784698380324966",
      "1498784703526731786",
      "1498784705854705694",
      "1498784721801314314",
      "1498784745868496977",
      "1498784746854154331"
    ];

    try {
      const sourceChannel = await message.guild.channels.fetch(sourceId).catch(() => null);
      if (!sourceChannel) {
        await message.channel.send("```\n❌ Source channel not found.\n```");
        return;
      }

      const overwrites = sourceChannel.permissionOverwrites.cache.map(overwrite => ({
        id: overwrite.id,
        allow: overwrite.allow.toArray(),
        deny: overwrite.deny.toArray(),
        type: overwrite.type
      }));

      let syncedCount = 0;
      let errorCount = 0;

      for (const targetId of targetIds) {
        try {
          const targetChannel = await message.guild.channels.fetch(targetId).catch(() => null);
          if (targetChannel) {
            await targetChannel.permissionOverwrites.set(sourceChannel.permissionOverwrites.cache);
            syncedCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          console.error(`Failed to sync perms for ${targetId}:`, err);
          errorCount++;
        }
      }

      await message.channel.send(`\`\`\`\n✅ Sync complete!\nSynced: ${syncedCount} channels\nErrors/Not Found: ${errorCount}\n\`\`\``);
    } catch (error) {
      console.error("Sync command error:", error);
      await message.channel.send("```\n❌ An error occurred during sync.\n```");
    }
  }
};
