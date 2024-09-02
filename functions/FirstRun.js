const ProgressBar = require('progress');
const createDatabase = require('./CreateDatabase');
const MessageSend = require('./MessageSend');

async function FirstRun() {
    try {
        createDatabase();
        const response = await axios.get(`${config.plex_url}/library/all?X-Plex-Token=${config.plex_token}`);
        const movies = response.data.MediaContainer.Metadata;
		const totalMovies = movies.length;
        const bar = new ProgressBar(':bar :percent', { total: movies.length });
		console.log(totalMovies);

        movies.forEach(movie => {
            db.run(`INSERT INTO movies (title, duration, photo) VALUES (?, ?, ?)`, [movie.title, movie.duration, movie.thumb], (err) => {
                if (err) {
                    console.error('Error inserting movie:', err.message);
                }
            });
            bar.tick();
        });
		MessageSend('Baza Danych','Baza Danych została zaaktualizowana!', '#F0F0F0');
    } catch (error) {
        console.error('Error during first run:', error.message);
    }
}

module.exports = FirstRun;