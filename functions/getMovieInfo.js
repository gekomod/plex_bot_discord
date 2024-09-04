const { EmbedBuilder } = require('discord.js');

async function getMovieInfo(title, channel) {
    try {
        const response = await axios.get(`${config.plex_url}/search?query=${title}&X-Plex-Token=${config.plex_token}`);
        const movies = response.data.MediaContainer.Metadata; // Assuming the response contains movie data

		console.log(`${config.plex_url}/search?query=${title}&X-Plex-Token=${config.plex_token}`);
        if (!movies) {
            return channel.send('Movie not found.');
        }
		movies.forEach(movie => {
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(movie.title)
				.setDescription(movie.summary)
				.addFields({ name: 'Release Date', value: `${movie.originallyAvailableAt}`, inline: true })
				.addFields({ name: 'Rating', value: `${movie.audienceRating}`, inline: true })
				.setThumbnail(`${config.plex_url}${movie.thumb}?X-Plex-Token=${config.plex_token}`)
				.setFooter({ text: 'Data retrieved from Plex'});

			channel.send({ embeds: [embed] });
		});
    } catch (error) {
        console.error(error);
        channel.send('An error occurred while fetching movie information.');
    }
}

module.exports = getMovieInfo;