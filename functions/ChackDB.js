config = require('../configs/config.json');
sqlite3 = require('sqlite3').verbose();

const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

db = new sqlite3.Database(config.database_file, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
});