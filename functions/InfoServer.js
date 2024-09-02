const axios = require('axios');
const config = require('../configs/config.json');

async function InfoServer() {
    try {
        const response = await axios.get(`${config.plex_url}/servers?X-Plex-Token=${config.plex_token}`);
        console.log("Informacje o serwerze: ", response.data.MediaContainer.Server);
    } catch (error) {
        console.error("Błąd podczas uzyskiwania informacji o serwerze: " + error.message);
    }
}

module.exports = InfoServer;