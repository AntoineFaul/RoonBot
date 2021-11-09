const { SlashCommandBuilder } = require('@discordjs/builders');
const { manager } = require('../audio');

module.exports = { 
  data: new SlashCommandBuilder()
    .setName('state')
    .setDescription('Show state'),

  async execute(interaction) {
    await interaction.deferReply();
    const state = await manager.state(interaction.member.guild);
    await interaction.editReply(`${state}`);
  },
}
