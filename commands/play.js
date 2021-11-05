const { SlashCommandBuilder } = require('@discordjs/builders');
const { manager } = require('../audio');

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
    /* TODO 
     * Replace reply par editReply and deferReply
     * Add check for in guild
     * Add check for link, type string
     * */
    const user = interaction.user;
    const guildId = interaction.guildId;
    const link = interaction.options.get("link", true);
    //console.log(interaction.member.voice);
    const songTitle = await manager.addSong(interaction.member.guild, interaction.member.voice.channelId, link);
    await interaction.editReply(`Playing ${songTitle}.`);
  },
}
