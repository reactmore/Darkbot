const { botHandler } = require("../handler");
const { BOT_TOKEN } = require("../../config");
const { startCommand, pingCommand } = require("../utils/defaultCommands");

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const { ExternalBotModel } = require("../../models");
const { ButtonBuilder } = require("../utils/buttonBuilder");
const { Button } = require("teleproto/tl/custom/button");

let state = false;
let token;
let timeout;

const botFolder = __dirname;

botHandler({
  name: "BotFather",
  BOT_TOKEN,
  commands: [
    pingCommand,
    startCommand,

    // =========================
    // ADD BOT
    // =========================
    {
      pattern: "addbot",
      description: "external bot adder",
      sudo: true,
      callback: async (m) => {
        state = "token";
        timeout = setTimeout(timeoutMessage, 60000, m);
        await m.send("Send me a bot token");
      },
    },

    // =========================
    // UPDATE BOT
    // =========================
    {
      pattern: "updatebot",
      description: "update external bot",
      sudo: true,
      callback: async (m) => {
        const bots = await ExternalBotModel.findAll();
        if (!bots.length) return await m.send("No External bots found");

        const button = new ButtonBuilder();

        for (const bot of bots) {
          button.add([
            Button.inline(bot.name, Buffer.from("updateBot-" + bot.name)),
          ]);
        }

        await m.client.sendMessage(m.jid, {
          message: "Select bot to update",
          buttons: button.build(),
        });
      },
    },

    // =========================
    // REMOVE BOT
    // =========================
    {
      pattern: "removebot",
      description: "remove external bot",
      sudo: true,
      callback: async (m) => {
        const bots = await ExternalBotModel.findAll();
        if (!bots.length) return await m.send("No External bots found");

        const button = new ButtonBuilder();

        for (const bot of bots) {
          button.add([
            Button.inline(bot.name, Buffer.from("removebot-" + bot.name)),
          ]);
        }

        await m.client.sendMessage(m.jid, {
          message: "Select bot to remove",
          buttons: button.build(),
        });
      },
    },

    // =========================
    // MESSAGE STATE HANDLER
    // =========================
    {
      on: "message",
      sudo: true,
      callback: async (m) => {
        if (!state || m.message === "/addbot") return;

        clearTimeout(timeout);

        // STEP 1: TOKEN
        if (state === "token") {
          token = m.message.trim();
          state = "link";
          timeout = setTimeout(timeoutMessage, 60000, m);
          return await m.send("Send bot gist url");
        }

        // STEP 2: LINK
        if (state === "link") {
          state = false;

          const links = m.message.match(/\bhttps?:\/\/\S+/gi);
          if (!links) return await m.send("No valid URL found");

          await ExternalBotModel.sync();

          for (const link of links) {
            let url;

            try {
              url = new URL(link);
            } catch {
              return await m.send("Invalid URL");
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

            let response;
            try {
              response = await axios(url + "?t=" + Date.now());
            } catch {
              return await m.send("Failed to fetch plugin");
            }

            const match = /name:\s*["'](.*?)["'],/g.exec(response.data);
            if (!match) {
              return await m.send("Invalid plugin. No name found!");
            }

            const pluginName = match[1].split(" ")[0];

            const content = response.data.replace(
              "BOT_TOKEN",
              `BOT_TOKEN:"${token}"`
            );

            const filePath = path.join(botFolder, pluginName + ".js");

            fs.writeFileSync(filePath, content);

            await ExternalBotModel.create({
              url,
              name: pluginName,
              token,
            });

            await m.send(pluginName + " installed.");
          }

          await m.send("Restarting runtime...");
          process.exit(1);
        }
      },
    },

    // =========================
    // CALLBACK HANDLER
    // =========================
    {
      on: "callback_query",
      callback: async (m) => {
        // REMOVE
        if (m.query.startsWith("removebot-")) {
          await m.answer();

          const name = m.query.split("-")[1];

          const external = await ExternalBotModel.findOne({
            where: { name },
          });

          if (!external) return await m.send("Plugin not found");

          const token = external.token;

          // 1️⃣ Hapus ExternalBotModel
          await external.destroy();

          // 2️⃣ Hapus session BotModel
          await BotModel.destroy({
            where: { token },
          });

          // 3️⃣ Hapus file plugin
          const filePath = path.join(botFolder, name + ".js");

          if (fs.existsSync(filePath)) {
            delete require.cache[require.resolve(filePath)];
            fs.unlinkSync(filePath);
          }

          await m.send(name + " removed successfully.");
          await m.send("Restarting runtime...");

          process.exit(1);
        }

        // UPDATE
        if (m.query.startsWith("updateBot-")) {
          await m.answer();

          const name = m.query.split("-")[1];

          const bot = await ExternalBotModel.findOne({
            where: { name },
          });

          if (!bot) return await m.send("Plugin not found");

          const filePath = path.join(botFolder, name + ".js");

          if (fs.existsSync(filePath)) {
            delete require.cache[require.resolve(filePath)];
            fs.unlinkSync(filePath);
          }

          await m.send("Bot will be restarted for update...");
          process.exit(1);
        }
      },
    },
  ],
});

async function timeoutMessage(m) {
  await m.send("Time out");
  state = false;
}
