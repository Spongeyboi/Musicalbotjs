const config = require("./config.json") 
const Discord = require("discord.js"),
client = new Discord.Client(),
settings = {
    prefix:config.prefix,
    token: process.env.TOKEN
};

const { Player } = require("discord-player");
// Create a new Player (you don't need any API Key)
const player = new Player(client);
// To easily access the player
client.player = player;
// add the trackStart event so when a song will be played this message will be sent
client.player.on('trackStart', (message, track) => message.channel.send(`Now playing ${track.title}...`))
 
client.player.on('trackStart', (message, track) => message.channel.send(`Now playing ${track.title}...`))
 
// Send a message when something is added to the queue
client.player.on('trackAdd', (message, track) => message.channel.send(`${track.title} has been added to the queue!`))
client.player.on('playlistAdd', (message, playlist) => message.channel.send(`${playlist.title} has been added to the queue (${playlist.items.length} songs)!`))
 
// Send messages to format search results
.on('searchResults', (message, query, tracks) => {
 
    const embed = new Discord.MessageEmbed()
    .setAuthor(`Here are your search results for ${query}!`)
    .setDescription(tracks.map((t, i) => `${i}. ${t.title}`))
    .setFooter('Send the number of the song you want to play!')
    message.channel.send(embed);
 
})
.on('searchInvalidResponse', (message, query, tracks, content, collector) => message.channel.send(`You must send a valid number between 1 and ${tracks.length}!`))
.on('searchCancel', (message, query, tracks) => message.channel.send('You did not provide a valid response... Please send the command again!'))
client.player.on('noResults', (message, query) => message.channel.send(`No results found on YouTube for ${query}!`))
 
// Send a message when the music is stopped
client.player.on('queueEnd', (message, queue) => message.channel.send('Music stopped as there is no more music in the queue!'))
client.player.on('channelEmpty', (message, queue) => message.channel.send('Music stopped as there is no more member in the voice channel!'))
client.player.on('botDisconnect', (message, queue) => message.channel.send('Music stopped as I have been disconnected from the channel!'))
 
// Error handling
client.player.on('error', (error, message) => {
    switch(error){
        case 'NotPlaying':
            message.channel.send('There is no music being played on this server!')
            break;
        case 'NotConnected':
            message.channel.send('You are not connected in any voice channel!')
            break;
        case 'UnableToJoin':
            message.channel.send('I am not able to join your voice channel, please check my permissions!')
            break;
        default:
            message.channel.send(`Something went wrong... Error: ${error}`)
    }
})


client.on("ready", () => {
    console.log("I'm ready !");
});
 
client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(settings.prefix)) return

    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    // !play Despacito
    // will play "Despacito" in the member voice channel
  try{
    if(command === config.playcommand){
      if (!args[0]) return message.channel.send("No video was specified")
        await client.player.play(message, args.slice().join(" "), message.member.user)
        // as we registered the event above, no need to send a success message here
    }
    if(command === config.stopcommand){
      await client.player.stop(message)
    }
    if(command === config.skipcommand){
      await client.player.skip(message)
    }
    if(command === config.queuecommand){
      await client.player.getQueue(message)
    }
    if(command === config.nowplayingcommand){
      await client.player.getQueue(message)
    }
    if(command === config.clearqueuecommand){
      await client.player.clearQueue(message)
    }
    if(command === config.loopcommand){
      if (args[0]==="true"){
        try{
          await client.player.setRepeatMode(message, true)
        }catch(err){
          message.channel.send("An error occured. "+error)
        }finally{
          message.channel.send("Now looping the track")
        }
      }else if (args[0]==="false"){
        try{
          await client.player.setRepeatMode(message, false)
        }catch(err){
          message.channel.send("An error occured. "+error)
        }finally{
          message.channel.send("looping is now off")
        }
      }else{
        message.channel.send("You must use the command like this `loop <true/false>`")
      }
    }
    if(command === config.removecommand){
      await client.player.remove(message,args[0])
    }
    if(command === config.helpcommand){
      const embed = new Discord.MessageEmbed()
      .setAuthor(client.user.username,client.user.displayAvatarURL({format:"png"}))
      .setDescription("!help             : This\n"+
      "!play [Song name] : Plays music\n"+
      "!skip             : Skips a track\n"+
      "!clearqueue       : Removes all tracks from the queue\n"+
      "!queue            : Gets the queue\n"+
      "!loop [true/false]: Enables queue looping\n"+
      "!nowplaying       : Gets the currently playing track\n"+
      "!stop             : Stops the song")
      await message.channel.send(embed)
    }
  }catch(error){
    message.channel.stopTyping(true)
    switch(error){
        case 'NotPlaying':
            message.channel.send('There is no music being played on this server!')
            break;
        case 'NotConnected':
            message.channel.send('You are not connected in any voice channel!')
            break;
        case 'UnableToJoin':
            message.channel.send('I am not able to join your voice channel, please check my permissions!')
            break;
        default:
            message.channel.send(`Something went wrong... Error: ${error}`)
    }
  }
});
 
client.login(settings.token).catch(err=>console.log("The bot couldn't start. Most likely your token is invalid or not specified. Make sure a environmenal token called TOKEN exists with your bot token."));
