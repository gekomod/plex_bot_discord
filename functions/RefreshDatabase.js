const ProgressBar = require('progress');
const MessageSend = require('./MessageSend');
const config = require('../configs/config.json');

async function RefreshDatabase(channel) {
   try {
        const response = await axios.get(`${config.plex_url}/library/sections/1/all?X-Plex-Token=${config.plex_token}`);
        const movies = response.data.MediaContainer.Metadata;
		const totalMovies = movies.length;
		console.log('Odświeżanie Bazy Danych...');

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
						MessageSend(`Nowy Film Dodany: ${movie.title}`,`Czas Trwania: ${Math.floor(movie.duration / 60000)} minut`,'#4682B4',`${config.plex_url}${movie.thumb}?X-Plex-Token=${config.plex_token}`);
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

module.exports = RefreshDatabase;