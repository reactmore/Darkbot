const { KeystoreModel } = require("../models");
const { StringSession } = require("telegram/sessions");
const { CreateClient } = require("../lib/createClient");
const { apiId, apiHash } = require("../config");
const { Logger } = require("telegram");
const { LogLevel } = require("telegram/extensions/Logger");

let globalClient = null;
let globalUser = null;
let currentSession = null;

async function initClient(sessionString) {
    const stringSession = new StringSession(sessionString);
    const client = new CreateClient(stringSession, apiId, apiHash, {
        connectionRetries: 1,
        baseLogger: new Logger(LogLevel.ERROR),
    });
    await client.connect();
    const me = await client.getMe();

    globalClient = client;
    globalUser = me.toJSON ? me.toJSON() : me;
    currentSession = sessionString;

    console.log("✅ Telegram client initialized as", globalUser.username || globalUser.firstName);
    return { client, me };
}

async function checkSession(req, res, next) {
    try {
        const sessionRow = await KeystoreModel.findOne({ where: { key: "session" } });
        const sessionString = sessionRow?.value;

        // No Sessions Found → redirect login
        if (!sessionString) {
            if (req.path === "/login") return next();
            return res.redirect("/login");
        }

        // If there is no global client or the session has changed → re-init
        if (!globalClient || sessionString !== currentSession) {
            await initClient(sessionString);
        }

        // Inject into request
        req.tgSession = currentSession;
        req.tgClient = globalClient;
        req.tgUser = globalUser;

        // If the user is already logged in but opens /login → redirect home
        if (req.path === "/login") {
            return res.redirect("/");
        }

        return next();
    } catch (err) {
        console.error("❌ Session expired/revoked:", err.message);

        // Delete invalid session
        await KeystoreModel.destroy({ where: { key: "session" } });

        // Reset globally so that the next request can be re-initialized
        globalClient = null;
        globalUser = null;
        currentSession = null;

        if (req.path === "/login") return next();
        return res.redirect("/login");
    }
}

module.exports = { checkSession };
