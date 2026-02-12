require("dotenv").config();

const { Logger } = require("teleproto");
const { StringSession } = require("teleproto/sessions");

const { CreateClient } = require("../lib/client/createClient");
const { apiId, apiHash, setSudo } = require("../config");
const { KeystoreModel } = require("../models");

const { registerDispatcher } = require("../core/dispatcher");
const { modules } = require("../core/moduleRegistry");
const { loadPlugins } = require("../plugins/loader");

const { handleLogin } = require("./login");
const { startHealthServer } = require("./health");
const { checkForUpdates } = require("./updateChecker");

async function bootstrap() {
    console.log("Bot is starting...");

    await KeystoreModel.sync();

    const session = await KeystoreModel.findOne({
        where: { key: "session" },
    });

    const stringSession = new StringSession(session?.value || "");

    const client = new CreateClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
        baseLogger: new Logger("info"),
    });

    registerDispatcher(client);

    await handleLogin(client, session, apiId, apiHash, KeystoreModel);

    await client.connect();

    console.log("Bot is ready.");

    const me = await client.getMe();
    setSudo(me.id);

    require("../runtime/index");

    await loadPlugins();
    await client.getDialogs();

    for (const module of modules) {
        if (module.on === "start") {
            module.callback(client);
        }
    }

    await client.sendMessage("me", {
        message: "Bot has been started..",
    });

    await checkForUpdates(client);
    startHealthServer(session);
}

module.exports = bootstrap;
