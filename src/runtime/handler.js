const { registerBot } = require("./registry/commandRegistry");

function botHandler(definition) {
    registerBot(definition);
}

module.exports = { botHandler };
