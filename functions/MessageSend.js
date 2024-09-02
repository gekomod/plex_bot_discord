const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
// Funkcja do wysyłania wiadomości na Discord
async function MessageSend(title,content,color,image) {
    try {
        const channel = await client.channels.fetch(config.discord_channel);
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(content)
	    	.setImage(image)
            .setColor(color);
        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error("Wystąpił błąd podczas wysyłania wiadomości:", error);
    }
}

client.login(config.bot_token).catch(err => {
    console.error('Failed to login:', err);
});

module.exports = MessageSend;