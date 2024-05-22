const ExternalBotsModel = require("../../models/ExternalBotsModel");
const fs = require("fs");
const { ButtonBuilder } = require("../utils/buttonBuilder");
const { Button } = require("telegram/tl/custom/button");
const axios = require("axios");

let state = false;
let token;
let timeout;

const addbotCommand = {
    pattern: "addbot",
    description: "external bot adder",
    sudo: true,
    callback: async (m, match) => {
        state = "token";
        timeout = setTimeout(timeoutMessage, 60000, m);
        await m.send("Send me a bot token");
    },
}

const updatebotCommand = {
    pattern: "updatebot",
    description: "update external bot",
    sudo: true,
    callback: async (m) => {
        let bots = await ExternalBotsModel.findAll();
        if (bots.length < 1) return await m.send("No External bots found");
        let msg = "Bots:\n";
        const button = new ButtonBuilder();
        for (let bot of bots) {
            button.add(
                Button.inline(bot.name, Buffer.from("command=botmanager&action=update&name=" + bot.name))
            );
        }
        await m.client.sendMessage(m.jid, {
            message: "Select bot to update",
            buttons: button.build(),
        });
    },
}

const removebotCommand = {
    pattern: "removebot",
    sudo: true,
    description: "remove external bot",
    callback: async (m, match) => {
        let bots = await ExternalBotsModel.findAll();
        if (bots.length < 1) return await m.send("No External bots found");
        let msg = "Bots:\n";
        const button = new ButtonBuilder();

        for (let bot of bots) {
            button.add(
                Button.inline(bot.name, Buffer.from("command=botmanager&action=remove&name=" + bot.name))
            );
        }
        await m.client.sendMessage(m.jid, {
            message: "Select bot to remove",
            buttons: button.build(),
        });
    },
};

async function handleCallbackQueryBotManager(m, callbackData) {

    if ('update' === callbackData.get('action') ?? null) {
        await m.answer();
        const name = callbackData.get('name');

        await ExternalBotsModel.sync();

        var plugin = await ExternalBotsModel.findAll({
            where: {
                name: name,
            },
        });

        if (plugin.length < 1) {
            return await m.send("plugin not found");
        } else {
            delete require.cache[
                require.resolve(__dirname + "/../bots/" + name + ".js")
            ];

            await fs.unlinkSync(__dirname + "/../bots/" + name + ".js");
            await m.send("updating...");
            await m.send("Bot will be restarted");
            process.exit(1);
        }
    }

    if ('remove' === callbackData.get('action') ?? null) {
        await m.answer();
        const name = callbackData.get('name');

        await ExternalBotsModel.sync();

        var plugin = await ExternalBotsModel.findAll({
            where: {
                name: name,
            },
        });

        if (plugin.length < 1) {
            return await m.send("plugin not found");
        } else {
            await plugin[0].destroy();
            const Message = name + " removed succesfully";
            delete require.cache[
                require.resolve(__dirname + "/../bots/" + name + ".js")
            ];
            await fs.unlinkSync(__dirname + "/../bots/" + name + ".js");
            await m.send(Message);
            await m.send("Restarting bot...");
            process.exit(1);
        }
        return;
    }

    return await m.answer();
}

async function handleIncomingMessageBotManager(m, match) {
    const chat_id = m.jid;
    const user_id = m.userId;

    if (!state || m.message === "/addbot") return;
    clearTimeout(timeout);
    if (state == "token") {
        state = "link";
        token = m.message;
        timeout = setTimeout(timeoutMessage, 60000, m);
        return await m.send("Send bot gist url");
    }
    if (state == "link") {
        await ExternalBotsModel.sync();
        state = false;
        match = m.message;
        let links = match.match(/\bhttps?:\/\/\S+/gi);
        for (let link of links) {
            try {
                var url = new URL(link);
            } catch {
                return await m.send("invalid url");
            }
            if (
                url.host === "gist.github.com" ||
                url.host === "gist.githubusercontent.com"
            ) {
                url = !url?.toString().endsWith("raw")
                    ? url.toString() + "/raw"
                    : url.toString();
            } else {
                url = url.toString();
            }
            try {
                var response = await axios(url + "?timestamp=" + new Date());
            } catch {
                return await m.send("invalid url");
            }
            let plugin_name = /name: ["'](.*)["'],/g.exec(response.data);
            var plugin_name_temp = response.data.match(/name: ["'](.*)["'],/g)
                ? response.data
                    .match(/name: ["'](.*)["'],/g)
                    ?.map((e) =>
                        e.replace("pattern", "").replace(/[^a-zA-Z]/g, "")
                    )
                : "temp";
            try {
                plugin_name = plugin_name[1].split(" ")[0];
            } catch {
                return await m.send("_Invalid plugin. No plugin name found!_");
            }
            response.data = response.data.replace(
                "BOT_TOKEN",
                `BOT_TOKEN:"${token}"`
            );
            fs.writeFileSync(
                __dirname + "/../bots/" + plugin_name + ".js",
                response.data
            );
            plugin_name_temp =
                plugin_name_temp.length > 1
                    ? plugin_name_temp.join(", ")
                    : plugin_name;
            try {
                require("./../bots/" + plugin_name);
                for (let i of bots) {
                    if (i.name == plugin_name) {
                        await i.init();
                    }
                }
            } catch (e) {
                fs.unlinkSync(__dirname + "/../bots/" + plugin_name + ".js");
                return await m.send("Error in plugin\n" + e);
            }
            await m.send(plugin_name + " installed.");
            await ExternalBotsModel.create({
                url: url,
                name: plugin_name,
                token,
            });
        }
        return;
    }
}

async function timeoutMessage(m) {
    await m.send("Time out");
    state = false;
}

module.exports = {
    addbotCommand,
    updatebotCommand,
    removebotCommand,
    handleCallbackQueryBotManager,
    handleIncomingMessageBotManager
};