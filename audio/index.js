"use strict";

const { joinVoiceChannel, getVoiceConnection, createAudioResource, createAudioPlayer, StreamType, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');

class Youtube {
  constructor() {

  }
  findVideo(query) {
    const videos = ytsr(query);
    return videos;
  }
  getAudioStream(video) {
    const infoPremise = ytdl.getInfo(video.url);
    const streamPremise = infoPremise.then((info) => {
      const formats = ytdl.filterFormats(info.formats, 'audioonly');
      const format = ytdl.chooseFormat(formats, { filter: format => format.container === 'webm' });
      const stream = ytdl(video.url, { format: format });
      return stream
    });
    return streamPremise;
  }
}

const youtube = new Youtube();

class Bot {
  constructor(guild) {
    this.guild = guild;
    this.queue = [];
    this.player = createAudioPlayer();

    this.player.on(AudioPlayerStatus.Idle, () => {
    });

    this.player.on(AudioPlayerStatus.Buffering, () => {
    });

    this.player.on(AudioPlayerStatus.Playing, () => {
    });

    this.player.on(AudioPlayerStatus.AutoPaused, () => {
    });

    this.player.on(AudioPlayerStatus.Paused, () => {
    });

    this.player.on('error', error => {
      console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
    });

    this.player.on('stateChange', (oldState, newState) => {
	    console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    });
  }

  connect(channel) {
    const connection = joinVoiceChannel({
      channelId: channel,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Signalling, () => {
    });

    connection.on(VoiceConnectionStatus.Connecting, () => {
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
    });


    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch (error) {
        connection.destroy();
      }

    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
    });

    connection.on('stateChange', (oldState, newState) => {
	    console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
    });

    connection.subscribe(this.player);
  }

  addQueue(video) {
    this.queue.push(video);
    //this.player.notify();
  }

  async startPlaying() {
    const stream = await youtube.getAudioStream(this.queue[0]);
    const resource = createAudioResource(stream, { inputType: StreamType.WebmOpus });
    console.log("Start playing");
    this.player.play(resource);
  }

  pause() {

  }

  leave() {
    this.player.stop();
    this.player = null;
    const connection = getVoiceConnection(this.guild.id);
    connection.destroy();
  }
}

class Manager {
  constructor() {
    this.bots = new Map([]);
  }
  async addSong(guild, channel, query) {
    /* TODO
     * Check if bot is not busy in another channel
     */
    let bot = this.bots.get(guild.id);
    if (bot === undefined) {
      bot = new Bot(guild);
      this.bots.set(guild.id, bot);
    }

    const videosPromise = youtube.findVideo(query.value);
    bot.connect(channel);

    const videos = await videosPromise
    const video = videos.items[0]
    bot.addQueue(video);
    bot.startPlaying();

    return video.title;
  }
}

const manager = new Manager();
module.exports = { manager }
