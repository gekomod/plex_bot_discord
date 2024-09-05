const axios = require('axios');
const config = require('../configs/config.json');
const MessageSend = require('./MessageSend');
const { EmbedBuilder } = require('discord.js');

async function InfoServer() {
    try {
        const response = await axios.get(`${config.plex_url}/servers?X-Plex-Token=${config.plex_token}`);
		const servers = response.data.MediaContainer.Server[0];
		
		const channel = await client.channels.fetch(config.discord_channel);
        const embed = new EmbedBuilder()
            .setTitle("Informacje O Serwerze")
            .setDescription("Podstawowe informacje o serwerze")
	    	.addFields({ name: 'Nazwa Serwera: ', value: `${servers.name}`, inline: true })
			.addFields({ name: 'Adres Serwera: ', value: `${servers.address}:${servers.port}`, inline: true })
			.addFields({ name: 'Versja Serwera: ', value: `${servers.version}`, inline: true });
        await channel.send({ embeds: [embed] });
		
    } catch (error) {
        console.error("Błąd podczas uzyskiwania informacji o serwerze: " + error.message);
    }
}

module.exports = InfoServer;