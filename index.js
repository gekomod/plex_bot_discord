const { Client, GatewayIntentBits, EmbedBuilder, Discord } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const ProgressBar = require('progress');
const fs = require('fs');

// Load configuration
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

// Initialize SQLite Database
let db = new sqlite3.Database(config.database_file, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create Database
function createDatabase() {
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS movies (id INTEGER PRIMARY KEY, title TEXT, photo TEXT, duration INTEGER)", (err) => {
            if (err) {
                console.error("Error creating database table:", err.message);
            }
        });
    });
}

// Funkcja do wysyłania wiadomości na Discord
async function messageSend(title,content,color,image) {
    try {
        const channel = await client.channels.fetch(config.discord_channel);
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(content)
	    .setImage(image)
            .setColor(color);
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Wystąpił błąd podczas wysyłania wiadomości:", error);
    }
}

// Function to start the first scan of all films on the Plex server
async function firstRun() {
    try {
        createDatabase();
        const response = await axios.get(`${config.plex_url}/library/sections/1/all?X-Plex-Token=${config.plex_token}`);
        const movies = response.data.MediaContainer.Metadata;
        const bar = new ProgressBar(':bar :percent', { total: movies.length });

        movies.forEach(movie => {
            db.run(`INSERT INTO movies (title, duration, photo) VALUES (?, ?, ?)`, [movie.title, movie.duration, movie.thumb], (err) => {
                if (err) {
                    console.error('Error inserting movie:', err.message);
                }
            });
            bar.tick();
        });

        console.log('First scan completed.');
    } catch (error) {
        console.error('Error during first run:', error.message);
    }
}

// New Movie In Database
async function newMovieInDatabase() {
    try {
        setInterval(async () => {
            const response = await axios.get(`${config.plex_url}/library/recentlyAdded?X-Plex-Token=${config.plex_token}`);
            const movies = response.data.MediaContainer.Metadata;
			const bar = new ProgressBar(':bar :percent', { total: movies.length });

            for (const movie of movies) {
                db.get("SELECT * FROM movies WHERE id = ?", [movie.ratingKey], (err, row) => {
                    if (err) {
                        console.error("Error querying database:", err.message);
                        return;
                    }
                    if (!row) {
                        db.run("INSERT INTO movies (id, title, photo, duration) VALUES (?, ?, ?, ?)", [movie.ratingKey, movie.title, movie.thumb, movie.duration], (err) => {
                            if (err) {
                                console.error("Error inserting movie into database:", err.message);
                                return;
                            }
		            		messageSend(movie.title,`Czas Trwania: ${Math.floor(movie.duration / 60000)} minut`,'#4682B4',`${config.plex_url}${movie.thumb}?X-Plex-Token=${config.plex_token}`);
                        });
                    }
                });
				bar.tick();
            }
        }, 10000);
    } catch (error) {
        console.error("Error fetching movies from Plex:", error.message);
    }
}

// Refresh Database
async function refreshDatabase() {
    try {
        const response = await axios.get(`${config.plex_url}/library/all?X-Plex-Token=${config.plex_token}`);
        const movies = response.data.MediaContainer.Metadata;
		const bar = new ProgressBar(':bar :percent', { total: movies.length });

        movies.forEach(movie => {
            db.get("SELECT * FROM movies WHERE id = ?", [movie.ratingKey], (err, row) => {
                if (err) {
                    console.error("Error querying database:", err.message);
                    return;
                }
                if (!row) {
                    db.run("INSERT INTO movies (id, title, photo, duration) VALUES (?, ?, ?, ?)", [movie.ratingKey, movie.title, movie.thumb, movie.duration], (err) => {
                        if (err) {
                            console.error("Error inserting movie into database:", err.message);
                            return;
                        }
                        const channel = client.channels.cache.get(config.discord_channel);
                        channel.send(`New Movie Added: **${movie.title}**\nDuration: ${movie.duration / 60000} minutes\n![Movie Image](${movie.thumb})`);
                    });
                }
            });
			bar.tick();
        });
    } catch (error) {
        console.error("Error refreshing database:", error.message);
    }
}

// Commands Discord
client.on('messageCreate', message => {
    if (message.content === '!refresh') {
        refreshDatabase();
        message.channel.send("Database refreshed!");
    } else if (message.content === '!list') {
        db.all("SELECT * FROM movies", [], (err, rows) => {
            if (err) {
                console.error("Error retrieving movies:", err.message);
                return;
            }
            const movieList = rows.map(row => `${row.title} (Duration: ${row.duration / 60000} minutes)`).join('\n');
	    rows.forEach(function(row) {
		message.channel.send(`${row.title}`);
	    });
        });
    } else if (message.content === '!who') {
        actualListing(message.channel);
    }

//console.log(message)
});

// Actual Listing
async function actualListing(channel) {
    try {
        const response = await axios.get(`${config.plex_url}/status/sessions?X-Plex-Token=${config.plex_token}`);
        const sessions = response.data.MediaContainer.Metadata;

        if (sessions.length > 0) {
            const watchingList = sessions.map(session => `${session.title} oglądany przez: ${session.User.title}`).join('\n');
            messageSend('Aktualnie Ogląda',`${watchingList}`,'#00FF00');
        } else {
	    messageSend('Aktualnie Ogląda', 'Nikt nie ogląda w danej chwili','#B22222');
        }
    } catch (error) {
        console.error("Error fetching watching sessions:", error.message);
    }
}

// Launching the Bot
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const channel = client.channels.cache.get(config.discord_channel);
    channel.send("Bot is online and ready to monitor Plex movies!");
	firstRun();
    newMovieInDatabase();
});

client.login(config.bot_token);
