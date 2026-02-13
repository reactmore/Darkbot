const path = require("path");
const input = require("input");
const express = require("express");
const http = require("http");
const fs = require("fs");
const qrcode = require("qrcode");

async function handleLogin(client, session, apiId, apiHash, ClientAccountModel) {
    if (session) return;

    if (process.env.WEB_LOGIN_ENABLED === "true") {
        await runWebLogin(client, apiId, apiHash);
    } else {
        await client.start({
            phoneNumber: async () => await input.text("number ?"),
            password: async () => await input.text("password?"),
            phoneCode: async () => await input.text("Code ?"),
            onError: (err) => console.log(err),
        });
    }

    await client.connect();
    const me = await client.getMe();

    console.log("Login successful! Saving session...");
    
    const newSessionString = client.session.save();

    const checkSession = await ClientAccountModel.findOne({
        where: { session: newSessionString }
    });

    console.log(checkSession);

    const existingMain = await ClientAccountModel.findOne({
        where: { isMain: true }
    });

    console.log(existingMain);

    if (!checkSession) {
        await ClientAccountModel.create({
            phone: me.phone,
            session: newSessionString,
            isActive: true,
            isMain: existingMain ? false : true
        });
    }

    console.log("Session saved. Please restart the bot.");
}

function runWebLogin(client, apiId, apiHash) {
    return new Promise((resolve, reject) => {
        const app = express();
        const server = http.createServer(app);
        app.use(express.json());

        let passwordResolver;
        let qrCodeDataUri = "";
        let loginStatus = "INITIALIZING";
        let statusMessage = "Server is starting...";

        const passwordPromise = new Promise((res) => {
            passwordResolver = res;
        });

        app.get("/login", (req, res) => {
            const loginPath = path.join(__dirname, "..", "views", "login.html");
            fs.readFile(loginPath, "utf8", (err, html) => {
                if (err) return res.status(500).send("Error loading login.html");

                const pageContent = html.replace(
                    "%%QR_CODE_IMAGE%%",
                    `<img src="${qrCodeDataUri}" alt="QR Code">`
                );

                res.send(pageContent);
            });
        });

        app.get("/", (req, res) => {
            if (loginStatus === "LOGGED_IN") {
                res.json({
                    status: "alive",
                    message: "Darkbot is running",
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                });
            } else {
                res.redirect("/login");
            }
        });

        app.get("/health", (req, res) => {
            res.json({
                status: loginStatus === "LOGGED_IN" ? "healthy" : "initializing",
                bot: loginStatus === "LOGGED_IN" ? "online" : "starting",
                loginStatus,
                timestamp: new Date().toISOString(),
            });
        });

        app.get("/status", (req, res) =>
            res.json({ status: loginStatus, message: statusMessage })
        );

        app.post("/submit-password", (req, res) => {
            const { password } = req.body;
            if (password && passwordResolver) {
                statusMessage = "Password submitted.";
                passwordResolver(password);
                res.json({ success: true });
            } else {
                res.status(400).json({ success: false });
            }
        });

        server.listen(process.env.PORT || 3000, async () => {
            try {
                await client.connect();

                await client.signInUserWithQrCode(
                    { apiId, apiHash },
                    {
                        qrCode: async (code) => {
                            const token = code.token.toString("base64url");
                            const url = `tg://login?token=${token}`;
                            qrCodeDataUri = await qrcode.toDataURL(url);
                            loginStatus = "WAITING_FOR_SCAN";
                            statusMessage = "Scan QR code.";
                        },
                        password: () => {
                            loginStatus = "PASSWORD_NEEDED";
                            return passwordPromise;
                        },
                        onError: (err) => {
                            loginStatus = "ERROR";
                            statusMessage = err.message;
                            console.error(err);
                        },
                    }
                );

                loginStatus = "LOGGED_IN";
                resolve();
            } catch (err) {
                loginStatus = "ERROR";
                console.error(err);
                resolve();
            }
        });
    });
}

module.exports = {
    handleLogin,
};
