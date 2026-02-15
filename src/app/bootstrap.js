require("dotenv").config();

const { Logger } = require("teleproto");
const { StringSession } = require("teleproto/sessions");

const { CreateClient } = require("../lib/client/createClient");
const { extendClient } = require("../lib/client/clientExtensions");


const { apiId, apiHash, setSudo } = require("../config");
const { ClientAccountModel } = require("../models");

const { registerDispatcher } = require("../core/dispatcher");
const { modules } = require("../core/moduleRegistry");
const { loadPlugins } = require("../plugins/loader");

const { handleLogin } = require("./login");
const { startHealthServer } = require("./health");
const { checkForUpdates } = require("./updateChecker");

async function bootstrap() {
    console.log("Bot is starting...");

    await ClientAccountModel.sync();

    // session single dulu 
    const clientAccount = await ClientAccountModel.findOne({
        where: { id: "1" },
    });

    const stringSession = new StringSession(clientAccount?.session || "");

    const client = new CreateClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
        baseLogger: new Logger("info"),
    });

    extendClient(client);

    registerDispatcher(client);

    await handleLogin(client, clientAccount, apiId, apiHash, ClientAccountModel);

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
    startHealthServer(clientAccount);
}

module.exports = bootstrap;
