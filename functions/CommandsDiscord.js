const refreshDatabase = require('./RefreshDatabase');
const listMovies = require('./ListMovie');
const actualListing = require('./ActualListing');
const InfoServer = require('./InfoServer');
const getMovieInfo = require('./getMovieInfo');

function urlifyRecursiveFunc(str) {
    if (str.length === 0) {
        return '';
    }
    if (str[0] === ' ') {
        return '%20' + urlifyRecursiveFunc(str.slice(1));
    }
    return str[0] + urlifyRecursiveFunc(str.slice(1));
}

function CommandsDiscord(messages) {
	
	// Commands Discord
	messages.on('messageCreate', message => {
		const prefix = '!';
		const args = message.content.slice(prefix.length).trim().split(' ');
		const command = args.shift().toLowerCase();
		if (message.content === '!refresh') {
			refreshDatabase();
			message.channel.send('Baza danych została odświeżona.');
		} else if (message.content === '!list') {
			listMovies();
		} else if (message.content === '!who') {
			actualListing(message.channel);
		} else if (message.content === '!info') {
			InfoServer();
		} else if (command === 'getmovieinfo') {
			const title = message.content.split(' ').slice(1).join(' ');
			let ot = urlifyRecursiveFunc(title);
			message.channel.send(`Command name: !getmovieinfo\nArguments: ${title}`);
        	getMovieInfo(title, message.channel);
		}

	});
		
}

module.exports = CommandsDiscord;