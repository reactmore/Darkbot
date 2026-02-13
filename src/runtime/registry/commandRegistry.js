const botDefinitions = [];

/**
 * Dipanggil oleh botFather.js
 */
function registerBot(definition) {
    botDefinitions.push(definition);
}

function getBotDefinitions() {
    return botDefinitions;
}

module.exports = {
    registerBot,
    getBotDefinitions,
};
