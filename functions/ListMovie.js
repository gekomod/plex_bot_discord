const { EmbedBuilder } = require('discord.js');
const config = require('../configs/config.json');

async function ListMovie() {
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
}

module.exports = ListMovie;