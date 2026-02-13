const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ConversationManager = require("../../../conversation/ConversationManager");
const { ExternalBotModel } = require("../../../../models");

const botFolder = path.join(__dirname, "../../../bots");

const flowName = "addBot";

ConversationManager.register(flowName, [

    async (msg) => {
        await msg.send("Send bot token");
    },

    async (msg, session) => {
        session.data.token = msg.message.trim();
        await msg.send("Send gist raw URL");
    },

    async (msg, session) => {

        const link = msg.message.trim();

        let url;
        try {
            url = new URL(link);
        } catch {
            await msg.send("Invalid URL");
            return;
        }

        if (
            url.host === "gist.github.com" ||
            url.host === "gist.githubusercontent.com"
        ) {
            url = url.toString().endsWith("raw")
                ? url.toString()
                : url.toString() + "/raw";
        } else {
            url = url.toString();
        }

        await msg.send("Downloading plugin...");

        const response = await axios(url + "?t=" + Date.now());

        const match = /name:\s*["'](.*?)["'],/g.exec(response.data);
        if (!match) {
            await msg.send("Invalid plugin. No name found.");
            return;
        }

        const pluginName = match[1].split(" ")[0];

        const content = response.data.replace(
            "BOT_TOKEN",
            `BOT_TOKEN:"${session.data.token}"`
        );

        // ✅ ALWAYS CREATE FOLDER
        const folderPath = path.join(botFolder, pluginName);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // ✅ ALWAYS WRITE index.js
        fs.writeFileSync(
            path.join(folderPath, "index.js"),
            content
        );

        await ExternalBotModel.create({
            url,
            name: pluginName,
            token: session.data.token
        });

        await msg.send(`${pluginName} installed.`);
        await msg.send("Restarting runtime...");

        process.exit(1);
    }

]);

module.exports = {
    pattern: "addbot",
    description: "Add external bot",
    admin: true,

    callback: async (m, match, botInstance) => {

        await ConversationManager.stop(m.jid, botInstance.token);

        await ConversationManager.start(
            m.jid,
            botInstance.token,
            flowName,
            m
        );
    }
};
