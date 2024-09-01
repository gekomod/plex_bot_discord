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
        const response = await axios.get(`${config.plex_url}/library/all?X-Plex-Token=${config.plex_token}`);
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
        }, config.timeRefresh);
    } catch (error) {
        console.error("Error fetching movies from Plex:", error.message);
    }
}

// Refresh Database
async function refreshDatabase() {
    try {
        const response = await axios.get(`${config.plex_url}/library/all?X-Plex-Token=${config.plex_token}`);
        const movies = response.data.MediaContainer.Metadata;
		const totalMovies = movies.length;
		console.log('Scanning for new movies...');
		console.log('Progress: [          ]');

		let progress = 0;

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
						messageSend(`Nowy Film Dodany: ${movie.title}`,`Czas Trwania: ${Math.floor(movie.duration / 60000)} minut`,'#4682B4',`${config.plex_url}${movie.thumb}?X-Plex-Token=${config.plex_token}`);
                    });
                }
            });
			    progress++;
    const progressBar = Math.floor((progress / totalMovies) * 10);
    process.stdout.write(`\rProgress: [${'='.repeat(progressBar)}${' '.repeat(10 - progressBar)}]`);
        });
    } catch (error) {
        console.error("Error refreshing database:", error.message);
    }
}

// Commands Discord
client.on('messageCreate', message => {
    if (message.content === '!refresh') {
        refreshDatabase();
        message.channel.send('Baza danych została odświeżona.');
    } else if (message.content === '!list') {
        db.all("SELECT * FROM movies", [], (err, rows) => {
            if (err) {
                console.error('Błąd podczas pobierania listy filmów:', err.message);
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle('Lista filmów')
                .setDescription(rows.map(row => row.title).join('\n'));
            message.channel.send({ embeds: [embed] });
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
    console.log(`Zalogowano jako ${client.user.tag}`);
    messageSend('Bot uruchomiony!','Działa','#2F4F4F');
	firstRun();
    newMovieInDatabase();
});

client.login(config.bot_token);
