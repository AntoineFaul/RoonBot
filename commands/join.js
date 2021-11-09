const { SlashCommandBuilder } = require('@discordjs/builders');
const { manager } = require('../audio');

module.exports = { 
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join voice channel'),

  async execute(interaction) {
    await interaction.deferReply();
    await manager.join(interaction.member.guild, interaction.member.voice.channelId);
    await interaction.editReply(`Joined`);
  },
}
