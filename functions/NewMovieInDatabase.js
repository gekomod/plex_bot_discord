const ProgressBar = require('progress');
const MessageSend = require('./MessageSend');
const axios = require('axios');
const config = require('../configs/config.json');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(config.database_file);

async function NewMovieInDatabase() {
    try {
        setInterval(async () => {
            const response = await axios.get(`${config.plex_url}/library/recentlyAdded?X-Plex-Token=${config.plex_token}`);
            const movies = response.data.MediaContainer.Metadata;
			const totalMovies = movies.length;
			console.log('Sprawdzanie czy są nowe filmy...');
			
			let progress = 0;

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
		            		MessageSend(movie.title,`Czas Trwania: ${Math.floor(movie.duration / 60000)} minut`,'#4682B4',`${config.plex_url}${movie.thumb}?X-Plex-Token=${config.plex_token}`);
                        });
                    }
                });
				progress++;
				const progressBar = Math.floor((progress / totalMovies) * 10);
				process.stdout.write(`\rProgress: [${'='.repeat(progressBar)}${' '.repeat(10 - progressBar)}]`);
            }
        }, config.timeRefresh);
    } catch (error) {
        console.error("Error fetching movies from Plex:", error.message);
    }
}

module.exports = NewMovieInDatabase;