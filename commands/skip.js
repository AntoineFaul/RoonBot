const { SlashCommandBuilder } = require('@discordjs/builders');
const { manager } = require('../audio');

module.exports = { 
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip current track'),

  async execute(interaction) {
    await interaction.deferReply();
    await manager.skip(interaction.member.guild);
    await interaction.editReply(`Skipped`);
  },
}
