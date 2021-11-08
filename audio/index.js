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

    this.player.on(AudioPlayerStatus.Idle, (oldState, newState) => {
      if (oldState.status === AudioPlayerStatus.Playing) {
        console.log("Playing ended, will start again");
        this.startPlaying();
      }
      if (oldState.status === AudioPlayerStatus.Buffering) {
        console.log("Buffering failed, will start again");
        this.startPlaying();
      }
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
      console.error(`Error: ${error.message}`);
    });

    this.player.on('stateChange', (oldState, newState) => {
	    console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    });
  }

  async waitForSong() {
    const start_time = new Date().getTime();
   
    while (true) {
      const video = this.queue.shift();
      if (video !== undefined) {
        return video;
      }
      if (new Date() > start_time + (1000*60*5)) {
        return undefined;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
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
        this.leave();
      }

    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
    });

    connection.on('stateChange', (oldState, newState) => {
	    console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
    });

    connection.subscribe(this.player);
    this.startPlaying();
  }

  addQueue(video) {
    this.queue.push(video);
  }

  async startPlaying() {
    this.player.stop();
    const video = await this.waitForSong();
    if (video === undefined) {
      this.leave();
    }
    const stream = await youtube.getAudioStream(video);
    const resource = createAudioResource(stream, { inputType: StreamType.WebmOpus });
    this.player.play(resource);
  }

  pause() {

  }

  leave() {
    manager.bots.delete(this.guild.id);
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
    const videosPromise = youtube.findVideo(query.value);
    
    let bot = this.bots.get(guild.id);
    if (bot === undefined) {
      console.log("New bot required");
      bot = new Bot(guild);
      this.bots.set(guild.id, bot);
      bot.connect(channel);
    }


    const videos = await videosPromise
    const video = videos.items[0]
    bot.addQueue(video);

    return video.title;
  }
  
  async quitBot(guild) {
    const bot = this.bots.get(guild.id);
    if (bot === undefined) {
      return;
    }
    bot.leave();
  }

  async skip(guild) {
    let bot = this.bots.get(guild.id);
    if (bot === undefined) {
      return "Nothing";
    }
    bot.startPlaying();
  }
}

const manager = new Manager();
module.exports = { manager }
