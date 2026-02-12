const { StringSession } = require("teleproto/sessions");
const { NewMessage, Raw } = require("teleproto/events");
const { CallbackQuery } = require("teleproto/events/CallbackQuery");
const { Api } = require("teleproto");

const { BotModel } = require("../../models");
const { createBot } = require("../../lib/client/createClient");
const Message = require("../../lib/message/Message");
const { Callback } = require("../utils/Callback");

const { apiId, apiHash, getSudo, DEVELOPMENT } = require("../../config");

class BotInstance {
    constructor(definition) {
        this.name = definition.name;
        this.token = definition.BOT_TOKEN;
        this.commands = definition.commands || [];
    }

    async start() {
        console.log(`${this.name} starting...`);

        await BotModel.sync();

        let session = "";
        const existing = await BotModel.findOne({
            where: { token: this.token },
        });

        if (existing) session = existing.session;

        const stringSession = new StringSession(session);

        this.client = await createBot(
            apiId,
            apiHash,
            this.token,
            stringSession
        );

        await this.setCommands();

        this.attachHandlers();

        await this.client.getMe();

        if (!existing) {
            await BotModel.create({
                token: this.token,
                session: this.client.session.save(),
            });
        }

        if (!DEVELOPMENT) {
            try {
                await this.client.sendMessage(getSudo(), {
                    message: `${this.name} started.`,
                });
            } catch { }
        }

        console.log(`${this.name} started.`);
    }

    attachHandlers() {

        this.client.addEventHandler(async (event) => {
            try {
                const msg = new Message(this.client, event.message);
                const text = event.message?.message;

                let commandMatched = false;

                // 1️⃣ HANDLE COMMAND PATTERN
                for (const cmd of this.commands) {

                    if (!cmd.pattern) continue;

                    const regex = new RegExp(`^\\/${cmd.pattern}(?:\\s+(.*))?$`);
                    const match = text?.match(regex);

                    if (match) {
                        if (cmd.sudo && getSudo() != msg.jid) return;

                        commandMatched = true;
                        await cmd.callback(msg, match, this);
                        break; // STOP setelah command match
                    }
                }

                // 2️⃣ HANDLE GENERIC MESSAGE (STATE MACHINE)
                if (!commandMatched) {
                    for (const cmd of this.commands) {

                        if (cmd.on !== "message") continue;

                        if (cmd.sudo && getSudo() != msg.jid) continue;

                        await cmd.callback(msg, [], this);
                    }
                }

            } catch (err) {
                console.error("=== BOT EVENT ERROR ===");
                console.error(err.stack || err);
            }

        }, new NewMessage({}));


        // CALLBACK QUERY
        this.client.addEventHandler(async (event) => {
            const cb = new Callback(this.client, event.query);

            for (const cmd of this.commands) {
                if (cmd.on === "callback_query") {
                    await cmd.callback(cb, this);
                }
            }

        }, new CallbackQuery({}));


        // INLINE
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
            if (cmd.pattern && cmd.description && !cmd.dontAdd) {
                list.push(
                    new Api.BotCommand({
                        command: cmd.pattern,
                        description: cmd.description,
                    })
                );
            }
        }

        await this.client.invoke(
            new Api.bots.SetBotCommands({
                scope: new Api.BotCommandScopeDefault(),
                langCode: "en",
                commands: list,
            })
        );
    }
}

module.exports = BotInstance;
