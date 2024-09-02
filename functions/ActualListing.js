const MessageSend = require('./MessageSend');

// Actual Listing
async function ActualListing(channel) {
    try {
        const response = await axios.get(`${config.plex_url}/status/sessions?X-Plex-Token=${config.plex_token}`);
        const sessions = response.data.MediaContainer.Metadata;

        if (sessions == null)
		{
			MessageSend('Aktualnie Ogląda', 'Nikt nie ogląda w danej chwili','#B22222');
		} 
		else
		{
            const watchingList = sessions.map(session => `${session.title} oglądany przez: ${session.User.title}`).join('\n');
            MessageSend('Aktualnie Ogląda',`${watchingList}`,'#00FF00');
        } 

    } catch (error) {
        console.error("Error fetching watching sessions:", error.message);
    }
}

module.exports = ActualListing;