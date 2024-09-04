const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const config = require('./configs/config.json');
require('./functions/ChackDB');
axios = require('axios');
const FirstRun = require('./functions/FirstRun');
const CreateDatabase = require('./functions/CreateDatabase');
const CommandsDiscord = require('./functions/CommandsDiscord');
const MessageSend = require('./functions/MessageSend');
newMovieInDatabase = require('./functions/NewMovieInDatabase');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


client.once('ready', async () => {
    console.log(`Zalogowano jako ${client.user.tag}`);
    MessageSend('Bot uruchomiony!','Działa','#2F4F4F');
    await CreateDatabase();
    await FirstRun();
    await CommandsDiscord(client);
	await newMovieInDatabase();
});

client.login(config.bot_token).catch(err => {
    console.error('Failed to login:', err);
});