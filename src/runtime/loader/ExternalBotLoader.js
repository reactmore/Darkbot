const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { ExternalBotModel } = require("../../models");

const botFolder = path.join(__dirname, "../bots");

async function loadExternalBots() {
    await ExternalBotModel.sync();
    const all = await ExternalBotModel.findAll();

    for (const bot of all) {
        const filePath = path.join(botFolder, `${bot.name}.js`);

        if (!fs.existsSync(filePath)) {
            let url = new URL(bot.url);

            if (
                url.host === "gist.github.com" ||
                url.host === "gist.githubusercontent.com"
            ) {
                url = url.toString().endsWith("raw")
                    ? url.toString()
                    : url.toString() + "/raw";
            }

            const response = await axios(url + "?t=" + Date.now());

            const content = response.data.replace(
                "BOT_TOKEN",
                `BOT_TOKEN:"${bot.token}"`
            );

            fs.writeFileSync(filePath, content);
        }
    }

    const files = fs.readdirSync(botFolder);

    for (const file of files) {
        if (file.endsWith(".js")) {
            require(path.join(botFolder, file));
        }
    }
}

module.exports = { loadExternalBots };
