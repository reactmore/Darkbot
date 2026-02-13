const { botHandler } = require("../../handler");
const { BOT_TOKEN } = require("../../../config");

botHandler({
    name: "BotFather",
    BOT_TOKEN,
    commandsPath: __dirname
});
