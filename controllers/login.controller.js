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
const { console } = require("inspector");

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
        res.send(html);
    });
}

async function getStatus(req, res) {
    res.json({ status: loginStatus, message: statusMessage });
}

async function getQr(req, res) {
    if (!qrCodeDataUri) {
        return res.json({ qr: "" });
    }
    res.json({ qr: qrCodeDataUri });
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
    try {
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
                onError: async (err) => {
                    console.error("Error during QR login:", err);

                    if (
                        err.errorMessage === "AUTH_TOKEN_EXPIRED" ||
                        err.message?.includes("auth_token_expired")
                    ) {
                        loginStatus = "RESTARTING";
                        statusMessage = "QR Code expired. Generating new one...";
                        qrCodeDataUri = ""; // Clear it so the client fetches it again.

                        // Reset the password resolver to prevent leaks.
                        passwordResolver = null;

                        setTimeout(() => {
                            startQrLogin().catch(console.error);
                        }, 1500);
                        return;
                    }

                    loginStatus = "ERROR";
                    statusMessage = `An error occurred: ${err.message}`;
                },
            }
        );

        loginStatus = "LOGGED_IN";
        statusMessage = "Login complete. Saving session...";

        const newSessionString = client.session.save();
        await KeystoreModel.upsert({ key: "session", value: newSessionString });
        return newSessionString;
    } catch (err) {
        console.error("Unexpected error in startQrLogin:", err);
        loginStatus = "ERROR";
        statusMessage = `Login failed: ${err.message}`;
        return null;
    }
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
    getQr,
    submitPassword,
    startQrLogin,
    startInteractiveLogin,
};
