import { ChannelType, PermissionsBitField } from "discord.js";

export const command = {
  name: "del",
  aliases: ["deletecategories"],
  async execute({ message, args, config }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.channel.send("```\n❌ You need Administrator permission.\n```");
      return;
    }

    const defaultIds = [
      "1498784666038046910",
      "1498784656944922695",
      "1498784655606808599",
      "1498784654457704609"
    ];

    const categoryIds = args.length > 0 ? args : defaultIds;

    let deletedCategories = 0;
    let deletedChannels = 0;

    for (const id of categoryIds) {
      try {
        const category = await message.guild.channels.fetch(id).catch(() => null);
        
        if (category && category.type === ChannelType.GuildCategory) {
          const channels = message.guild.channels.cache.filter(c => c.parentId === category.id);
          
          for (const [channelId, channel] of channels) {
            await channel.delete(`Deleted by ${message.author.tag} via del command`).catch(() => {});
            deletedChannels++;
          }
          
          await category.delete(`Deleted by ${message.author.tag} via del command`).catch(() => {});
          deletedCategories++;
        } else if (category) {
          // If it's a channel but not a category, delete it anyway if explicitly provided
          if (args.length > 0) {
            await category.delete(`Deleted by ${message.author.tag} via del command`).catch(() => {});
            deletedChannels++;
          }
        }
      } catch (error) {
        console.error(`Error deleting channel/category ${id}:`, error);
      }
    }

    await message.channel.send(`\`\`\`\n✅ Deleted ${deletedCategories} categories and ${deletedChannels} channels.\n\`\`\``);
  }
};
