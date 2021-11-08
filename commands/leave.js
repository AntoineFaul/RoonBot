const { SlashCommandBuilder } = require('@discordjs/builders');
const { manager } = require('../audio');

module.exports = { 
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave voice channel'),

  async execute(interaction) {
    await interaction.deferReply();
    await manager.quitBot(interaction.member.guild);
    await interaction.editReply(`Bye`);
  },
}
