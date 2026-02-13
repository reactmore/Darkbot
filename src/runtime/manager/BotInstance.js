const fs = require("fs");
const path = require("path");

const { StringSession } = require("teleproto/sessions");
const { NewMessage, Raw } = require("teleproto/events");
const { CallbackQuery } = require("teleproto/events/CallbackQuery");
const { Api } = require("teleproto");

const { BotModel } = require("../../models");
const { createBot } = require("../../lib/client/createClient");
const Message = require("../../lib/message/Message");
const { Callback } = require("../utils/Callback");
const ConversationManager = require("../conversation/ConversationManager");

const { apiId, apiHash, getSudo, DEVELOPMENT } = require("../../config");

class BotInstance {

    constructor(definition) {
        this.definition = definition;
        this.name = definition.name;
        this.token = definition.BOT_TOKEN;
        this.commandsPath = definition.commandsPath;
        this.commands = [];
    }

    async start() {
        console.log(`${this.name} starting...`);

        await BotModel.sync();

        let session = "";
        const existing = await BotModel.findOne({
            where: { token: this.token }
        });

        if (existing) session = existing.session;

        const stringSession = new StringSession(session);

        try {

            this.client = await createBot(
                apiId,
                apiHash,
                this.token,
                stringSession
            );

        } catch (err) {

            if (err.seconds) {
                console.log(
                    `Flood wait ${err.seconds}s for ${this.name}... waiting...`
                );
                await new Promise(res => setTimeout(res, err.seconds * 1000));
                return this.start(); // retry
            }

            throw err;
        }
       

        this.loadCommands();

        await this.setCommands();

        this.attachHandlers();

        await this.client.getMe();

        if (!existing) {
            await BotModel.create({
                token: this.token,
                session: this.client.session.save()
            });
        }

        if (!DEVELOPMENT) {
            try {
                await this.client.sendMessage(getSudo(), {
                    message: `${this.name} started`
                });
            } catch { }
        }

        console.log(`${this.name} started`);
    }

    loadCommands() {

        // ==============================
        // 1️⃣ MODULAR MODE
        // ==============================
        if (this.commandsPath) {

            const categories = ["admin", "user", "system"];

            for (const category of categories) {

                const folder = path.join(this.commandsPath, category);

                if (!fs.existsSync(folder)) continue;

                const files = fs.readdirSync(folder);

                for (const file of files) {
                    if (file.endsWith(".js")) {
                        const command = require(path.join(folder, file));
                        this.commands.push(command);
                    }
                }
            }

            return;
        }

        // ==============================
        // 2️⃣ LEGACY MODE (GIST EXTERNAL BOT)
        // ==============================
        if (Array.isArray(this.definition.commands)) {
            this.commands = this.definition.commands;
        }
    }

    attachHandlers() {

        // ==============================
        // MESSAGE HANDLER
        // ==============================
        this.client.addEventHandler(async (event) => {

            try {
                const msg = new Message(this.client, event.message);
                const text = event.message?.message;

                let commandMatched = false;

                // =========================================
                // 1️⃣ PRIORITY: MATCH COMMAND FIRST
                // =========================================
                for (const cmd of this.commands) {

                    if (!cmd.pattern) continue;

                    const regex = new RegExp(`^\\/${cmd.pattern}(?:\\s+(.*))?$`);
                    const match = text?.match(regex);

                    if (match) {

                        if (cmd.admin && getSudo() != msg.jid) return;

                        commandMatched = true;
                        await cmd.callback(msg, match, this);
                        return; // ⛔ STOP HERE
                    }
                }

                // =========================================
                // 2️⃣ THEN HANDLE CONVERSATION
                // =========================================
                if (await ConversationManager.handle(msg, this.token)) {
                    return;
                }

                // =========================================
                // 3️⃣ GENERIC MESSAGE LISTENER
                // =========================================
                for (const cmd of this.commands) {

                    if (cmd.on === "message") {

                        if (cmd.admin && getSudo() != msg.jid) continue;

                        await cmd.callback(msg, [], this);
                    }
                }

            } catch (err) {
                console.error("=== BOT ERROR ===");
                console.error(err.stack || err);
            }

        }, new NewMessage({}));


        // ==============================
        // CALLBACK QUERY HANDLER
        // ==============================
        this.client.addEventHandler(async (event) => {

            const cb = new Callback(this.client, event.query);

            for (const cmd of this.commands) {
                if (cmd.on === "callback_query") {
                    await cmd.callback(cb, this);
                }
            }

        }, new CallbackQuery({}));


        // ==============================
        // INLINE QUERY HANDLER
        // ==============================
        this.client.addEventHandler((event) => {

            if (event instanceof Api.UpdateBotInlineQuery) {

                for (const cmd of this.commands) {

                    if (cmd.on === "inline_query") {
                        cmd.callback(event, this.client);
                    }
                }
            }

        }, new Raw({}));
    }

    async setCommands() {

        const list = [];

        for (const cmd of this.commands) {

            if (cmd.pattern && cmd.description) {

                list.push(
                    new Api.BotCommand({
                        command: cmd.pattern,
                        description: cmd.description
                    })
                );
            }
        }

        await this.client.invoke(
            new Api.bots.SetBotCommands({
                scope: new Api.BotCommandScopeDefault(),
                langCode: "en",
                commands: list
            })
        );
    }
}

module.exports = BotInstance;
