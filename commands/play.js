const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = { 
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a video')
    .addStringOption(option => 
      option.setName('link')
        .setDescription('Link to the youtube video')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    await interaction.reply('Playing');
  },
}
