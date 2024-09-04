const ProgressBar = require('progress');
const createDatabase = require('./CreateDatabase');
const MessageSend = require('./MessageSend');
const databaseProgress = require('./utils/databaseProgress');
const fs = require('fs');

async function FirstRun() {
	if (!fs.existsSync(config.database_file)) {
		try {
			createDatabase();
			const response = await axios.get(`${config.plex_url}/library/all?X-Plex-Token=${config.plex_token}`);
			const movies = response.data.MediaContainer.Metadata;
			const totalMovies = movies.length;

			for (let currentRow = 0; currentRow < totalMovies; currentRow++) {
				const movie = movies[currentRow];
				db.run(`INSERT INTO movies (ratingKey, title, duration, photo) VALUES (?, ?, ?, ?)`, [movie.ratingKey, movie.title, movie.duration, movie.thumb], (err) => {
					if (err) {
						console.error('Error inserting movie:', err.message);
					}
				});
				databaseProgress(totalMovies, currentRow + 1);
			}

			MessageSend('Baza Danych','Baza Danych została zaaktualizowana!', '#F0F0F0');
		} catch (error) {
			console.error('Error during first run:', error.message);
		}
	}
}

module.exports = FirstRun;