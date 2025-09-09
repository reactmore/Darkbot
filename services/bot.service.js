/// <reference path="./../types.js" />
const { Logger, Api } = require("telegram");
const { Button } = require("telegram/tl/custom/button");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const { LogLevel } = require("telegram/extensions/Logger");
const Message = require("../lib/Message");
const { CreateClient } = require("../lib/createClient");
const { apiId, apiHash, setSudo } = require("../config");
const simpleGit = require("simple-git");
const fs = require("fs");
const axios = require("axios");
const { ExternalPluginsModel } = require("../models");

const git = simpleGit();
const modules = [];

function Module(moduleConfig, callback) {
    modules.push({ ...moduleConfig, callback });
}

async function initBot(sessionString) {
    const client = new CreateClient(new StringSession(sessionString), apiId, apiHash, {
        connectionRetries: 5,
        baseLogger: new Logger(LogLevel.ERROR),
    });

    client.addEventHandler(async (event) => {
        const msg = new Message(client, event.message);
        const message = event.message.message;
        const sender = await event.message.getSender();

        if (message) {
            for (const module of modules) {
                if ((module.fromMe && sender.self) || !module.fromMe) {
                    const regex = new RegExp(`^\\.\\s*${module.pattern}`);
                    const match = message.match(regex);
                    if (match) module.callback(msg, match);
                }
            }
        }
        for (const module of modules) {
            if (module.on === "message" && ((module.fromMe && sender.self) || !module.fromMe)) {
                module.callback(msg);
            }
        }
    }, new NewMessage({}));

    await client.connect();
    console.log("Bot is ready.");

    const me = await client.getMe();
    setSudo(me.id);
    require("../bot/index");
    await client.getDialogs();

    for (const module of modules) {
        if (module.on === "start") {
            module.callback(client);
        }
    }

    await client.sendMessage("me", { message: "Darkbot has been started.." });

    // cek update dari git
    const commits = await git.log(["main..origin/main"]);
    if (commits.total !== 0) {
        let changelog = "_Pending updates:_\n\n";
        commits.all.forEach((c, i) => {
            changelog += `${i + 1}• **${c.message}**\n`;
        });
        changelog += `\n_Use ".update start" to start the update_`;
        await client.sendMessage("me", { message: changelog });
    }

    // load plugins eksternal
    await ExternalPluginsModel.sync();
    const plugins = await ExternalPluginsModel.findAll();
    for (const plugin of plugins) {
        const file = `./plugins/${plugin.name}.js`;
        if (!fs.existsSync(file)) {
            let url = new URL(plugin.url);
            if (url.host.includes("gist.github.com")) {
                url = url.toString().endsWith("raw") ? url.toString() : url.toString() + "/raw";
            }
            const res = await axios(url + "?timestamp=" + new Date());
            fs.writeFileSync(file, res.data);
        }
    }
    fs.readdirSync("./plugins/").forEach((file) => {
        if (file.endsWith(".js")) require(`../plugins/${file}`);
    });

    return client;
}

Module(
    { pattern: "start", fromMe: true, desc: "Start command", use: "utility" },
    async (m) => {
        const sender = await m.message.getSender();
        await m.client.sendMessage(sender, {
            message: `Hi, your ID is ${m.message.senderId}`,
        });
    }
);

module.exports = { initBot, Module, modules };
