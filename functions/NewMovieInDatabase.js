const ProgressBar = require('progress');
const MessageSend = require('./MessageSend');
const databaseProgress = require('./utils/databaseProgress');

async function NewMovieInDatabase() {
    try {
        setInterval(async () => {	
            const response = await axios.get(`${config.plex_url}/library/all?X-Plex-Token=${config.plex_token}`);
            const movies = response.data.MediaContainer.Metadata;
			const totalMovies = movies.length;

			console.info('Sprawdzanie czy są nowe filmy...');

            for (let currentRow = 0; currentRow < totalMovies; currentRow++) {
			  const movie = movies[currentRow];
                db.get("SELECT * FROM movies WHERE ratingKey = ?", [movie.ratingKey], (err, row) => {
					//if(row.id == movie.ratingKey) { console.log(`Istnieje w bazie ${movie.title}`); }
                    if (err) {
                        console.error("Error querying database:", err.message);
                        return;
                    }
                    if(!row) 
					{
                        db.run("INSERT INTO movies (ratingKey, title, photo, duration) VALUES (?, ?, ?, ?)", [movie.ratingKey, movie.title, movie.thumb, movie.duration], (err) => {
                            if (err) {
                                console.error("Error inserting movie into database:", err.message);
                                return;
                            }
		            		MessageSend(movie.title,`Czas Trwania: ${Math.floor(movie.duration / 60000)} minut`,'#4682B4',`${config.plex_url}${movie.thumb}?X-Plex-Token=${config.plex_token}`,'NEW');
                        });
                    }
                });
				databaseProgress(totalMovies, currentRow + 1);
            }
        }, config.timeRefresh);
    } catch (error) {
        console.error("Error fetching movies from Plex:", error.message);
    }
}

module.exports = NewMovieInDatabase;