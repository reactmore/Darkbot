/// <reference path="./../types.js" />
const fs = require("fs");
const qrcode = require("qrcode");
const { StringSession } = require("telegram/sessions");
const { Logger } = require("telegram");
const { LogLevel } = require("telegram/extensions/Logger");
const { CreateClient } = require("../lib/createClient");
const input = require("input");
const { KeystoreModel } = require("../models");
const { apiId, apiHash } = require("../config");

let qrCodeDataUri = "";
let loginStatus = "INITIALIZING";
let statusMessage = "Server is starting...";
let passwordResolver;
const passwordPromise = new Promise((res) => (passwordResolver = res));

const stringSession = new StringSession("");
const client = new CreateClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    baseLogger: new Logger(LogLevel.ERROR),
});

async function getLoginPage(req, res) {
    fs.readFile("views/login.html", "utf8", (err, html) => {
        if (err) return res.status(500).send("Error: Could not load login.html");
        const pageContent = html.replace(
            "%%QR_CODE_IMAGE%%",
            `<img src="${qrCodeDataUri}" alt="QR Code">`
        );
        res.send(pageContent);
    });
}

async function getStatus(req, res) {
    res.json({ status: loginStatus, message: statusMessage });
}

async function submitPassword(req, res) {
    const { password } = req.body;
    if (password && passwordResolver) {
        statusMessage = "Password submitted. Waiting for Telegram...";
        passwordResolver(password);
        return res.json({ success: true });
    }
    return res.status(400).json({ success: false, message: "Password not provided." });
}

async function startQrLogin() {
    await client.connect();
    await client.signInUserWithQrCode(
        { apiId, apiHash },
        {
            qrCode: async (code) => {
                const token = code.token.toString("base64url");
                const url = `tg://login?token=${token}`;
                qrCodeDataUri = await qrcode.toDataURL(url);
                loginStatus = "WAITING_FOR_SCAN";
                statusMessage = "Please scan the QR code in your browser.";
            },
            password: () => {
                loginStatus = "PASSWORD_NEEDED";
                statusMessage = "2FA Password Required.";
                return passwordPromise;
            },
            onError: (err) => {
                loginStatus = "ERROR";
                statusMessage = `An error occurred: ${err.message}`;
                console.error("Error during QR login:", err);
            },
        }
    );

    loginStatus = "LOGGED_IN";
    statusMessage = "Login complete. Saving session...";

    const newSessionString = client.session.save();
    await KeystoreModel.upsert({ key: "session", value: newSessionString });
    return newSessionString;
}

async function startInteractiveLogin() {
    await client.start({
        phoneNumber: async () => await input.text("number ?"),
        password: async () => await input.text("password?"),
        phoneCode: async () => await input.text("Code ?"),
        onError: (err) => console.log(err),
    });

    loginStatus = "LOGGED_IN";
    statusMessage = "Login complete. Saving session...";

    const newSessionString = client.session.save();
    await KeystoreModel.upsert({ key: "session", value: newSessionString });
    return newSessionString;
}

module.exports = {
    getLoginPage,
    getStatus,
    submitPassword,
    startQrLogin,
    startInteractiveLogin,
};
