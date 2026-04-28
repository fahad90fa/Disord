import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} from "discord.js";

const COLOR_ROLES = [
  { id: "1498784523159212123", label: "Red", style: ButtonStyle.Danger, customId: "role_red" },
  { id: "1498784523880759480", label: "Green", style: ButtonStyle.Success, customId: "role_green" },
  { id: "1498784525688242379", label: "Peach", style: ButtonStyle.Secondary, customId: "role_peach" },
  { id: "1498784526976159864", label: "Purple", style: ButtonStyle.Primary, customId: "role_purple" },
  { id: "1498784534496280740", label: "Black", style: ButtonStyle.Secondary, customId: "role_black" },
  { id: "1498784532365705308", label: "Pink", style: ButtonStyle.Secondary, customId: "role_pink" },
];

export const command = {
  name: "colorroles",
  aliases: ["setroles"],
  async execute({ message, config }) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await message.channel.send("```\n❌ You need Administrator permission.\n```");
      return;
    }

    const channelId = "1498784690805669938";
    const channel = await message.guild.channels.fetch(channelId).catch(() => null);

    if (!channel?.isTextBased()) {
      await message.channel.send("```\n❌ Target channel not found or is not text-based.\n```");
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("🎨 Select Your Color Role")
      .setDescription("Click the buttons below to pick a color for your name! Clicking again will remove the role.")
      .setColor(0x2b2d31)
      .setFooter({ text: "Self Roles • ZeroDay Tools" });

    const rows = [];
    for (let i = 0; i < COLOR_ROLES.length; i += 5) {
      const row = new ActionRowBuilder();
      COLOR_ROLES.slice(i, i + 5).forEach((role) => {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(role.customId)
            .setLabel(role.label)
            .setStyle(role.style)
        );
      });
      rows.push(row);
    }

    await channel.send({ embeds: [embed], components: rows });
    await message.channel.send(`✅ Self-roles embed sent to ${channel}`);
  },
};

export async function handleInteraction({ interaction }) {
  if (!interaction.isButton()) return false;
  
  const roleData = COLOR_ROLES.find((r) => r.customId === interaction.customId);
  if (!roleData) return false;

  await interaction.deferReply({ ephemeral: true });

  const role = interaction.guild.roles.cache.get(roleData.id);
  if (!role) {
    await interaction.editReply("❌ This role no longer exists.");
    return true;
  }

  try {
    if (interaction.member.roles.cache.has(role.id)) {
      await interaction.member.roles.remove(role);
      await interaction.editReply(`✅ Removed the **${roleData.label}** role.`);
    } else {
      // Optional: Remove other color roles first if you want only one color at a time
      const otherColorIds = COLOR_ROLES.map(r => r.id);
      const rolesToRemove = interaction.member.roles.cache.filter(r => otherColorIds.includes(r.id));
      if (rolesToRemove.size > 0) {
        await interaction.member.roles.remove(rolesToRemove);
      }
      
      await interaction.member.roles.add(role);
      await interaction.editReply(`✅ Added the **${roleData.label}** role.`);
    }
  } catch (error) {
    console.error("Role interaction error:", error);
    await interaction.editReply("❌ Failed to update your roles. Check bot permissions.");
  }

  return true;
}
