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

    const user = interaction.user;
    const guildId = interaction.guildId;
    console.log(interaction.member.voice.channelId);
    console.log(interaction);
    await interaction.editReply('Playing');
  },
}
