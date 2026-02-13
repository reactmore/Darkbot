const { botHandler } = require("../../handler");

botHandler({
    name: "PingProBot",
    BOT_TOKEN,
    commandsPath: __dirname
});
