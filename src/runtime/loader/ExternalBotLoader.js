const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { ExternalBotModel } = require("../../models");

const botFolder = path.join(__dirname, "../bots");

async function loadExternalBots() {

    await ExternalBotModel.sync();

    const all = await ExternalBotModel.findAll();

    for (const bot of all) {

        const folderPath = path.join(botFolder, bot.name);
        const filePath = path.join(folderPath, "index.js");

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

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

    // LOAD ALL BOT FOLDERS
    const folders = fs.readdirSync(botFolder);

    for (const folder of folders) {

        const indexPath = path.join(botFolder, folder, "index.js");

        if (fs.existsSync(indexPath)) {
            require(indexPath);
        }
    }
}

module.exports = { loadExternalBots };
