const refreshDatabase = require('./RefreshDatabase');
const listMovies = require('./ListMovie');
const actualListing = require('./ActualListing');
const InfoServer = require('./InfoServer');

function CommandsDiscord(messages) {
	
	// Commands Discord
	messages.on('messageCreate', message => {
		if (message.content === '!refresh') {
			refreshDatabase();
			message.channel.send('Baza danych została odświeżona.');
		} else if (message.content === '!list') {
			listMovies();
		} else if (message.content === '!who') {
			actualListing(message.channel);
		} else if (message.content === '!info') {
			InfoServer();
		}

	});
		
}

module.exports = CommandsDiscord;