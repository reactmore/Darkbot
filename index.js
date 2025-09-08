/// <reference path="./types.js" />
const { Logger } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");
const fs = require("fs");
const simpleGit = require("simple-git");
const { LogLevel } = require("telegram/extensions/Logger");
const Message = require("./lib/Message");
const { CreateClient } = require("./lib/createClient");
const git = simpleGit();
require("dotenv").config();
const { apiId, apiHash, setSudo } = require("./config");
const {ExternalPluginsModel, KeystoreModel} = require("./models");
const { default: axios } = require("axios");
const express = require("express");
const qrcode = require("qrcode");
const http = require("http");

const modules = [];

/**
 *
 * @type {Module}
 */
function Module(moduleConfig, callback) {
  modules.push({ ...moduleConfig, callback });
}

(async () => {
  console.log("Bot is starting...");
  await KeystoreModel.sync();
  const session = await KeystoreModel.findOne({ where: { key: "session" } });
  const stringSession = new StringSession(session?.value || "");
  const client = new CreateClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    baseLogger: new Logger(LogLevel.ERROR),
  });

  client.addEventHandler(async (event) => {
    let test = new Message(client, event.message);
    const message = event.message.message;
    const sender = await event.message.getSender();

    if (message) {
      for (const module of modules) {
        if ((module.fromMe && sender.self) || !module.fromMe) {
          const regex = new RegExp(`^\\.\\s*${module.pattern}`);
          const match = message.match(regex);
          if (match) {
            module.callback(test, match);
          }
        }
      }
    }
    for (const module of modules) {
      if (
        module.on &&
        module.on == "message" &&
        ((module.fromMe && sender.self) || !module.fromMe)
      ) {
        module.callback(test);
      }
    }
  }, new NewMessage({}));

  if (!session) {
    if (process.env.WEB_LOGIN_ENABLED === "true") {
      const runLoginServer = () => {
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

          // --- Server routes ---
          // Login page
          app.get("/login", (req, res) => {
            fs.readFile("./login.html", "utf8", (err, html) => {
              if (err)
                return res.status(500).send("Error: Could not load login.html");
              const pageContent = html.replace(
                "%%QR_CODE_IMAGE%%",
                `<img src="${qrCodeDataUri}" alt="QR Code">`
              );
              res.send(pageContent);
            });
          });

          // Health check endpoints
          app.get("/", (req, res) => {
            if (loginStatus === "LOGGED_IN") {
              res.json({
                status: "alive",
                message: "Darkbot is running",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
              });
            } else {
              // Redirect to login during setup
              res.redirect("/login");
            }
          });

          app.get("/health", (req, res) => {
            res.json({
              status: loginStatus === "LOGGED_IN" ? "healthy" : "initializing",
              bot: loginStatus === "LOGGED_IN" ? "online" : "starting",
              loginStatus: loginStatus,
              timestamp: new Date().toISOString(),
            });
          });

          app.get("/status", (req, res) =>
            res.json({ status: loginStatus, message: statusMessage })
          );
          app.post("/submit-password", (req, res) => {
            const { password } = req.body;
            if (password && passwordResolver) {
              statusMessage = "Password submitted. Waiting for Telegram...";
              passwordResolver(password);
              res.json({ success: true });
            } else {
              res
                .status(400)
                .json({ success: false, message: "Password not provided." });
            }
          });

          server.on("error", (err) => {
            console.error("Server error:", err);
            reject(err);
          });

          const PORT = process.env.PORT || 3000;
          server.listen(PORT, async () => {
            console.log(
              `Combined login/health server started on port ${PORT}. Please open http://localhost:${PORT}/login in your browser.`
            );
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
                    statusMessage = "Please scan the QR code in your browser.";
                    console.log(
                      "QR Code generated. Waiting for scan on the webpage."
                    );
                  },
                  password: () => {
                    loginStatus = "PASSWORD_NEEDED";
                    statusMessage = "2FA Password Required.";
                    console.log(
                      "Telegram is requesting 2FA password. Waiting for input on webpage."
                    );
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
              statusMessage =
                "Success! Login complete. Server will continue running for health checks.";
              console.log(
                "Login successful via web interface! Server will continue running."
              );

              // Don't close the server anymore - keep it running for health checks
              resolve();
            } catch (error) {
              loginStatus = "ERROR";
              statusMessage = `Login failed: ${error.message}`;
              console.error("Failed to complete web login:", error);
              resolve(); // Still resolve to continue bot initialization
            }
          });
        });
      };

      // Now we just await the function that encapsulates everything.
      await runLoginServer();
    } else {
      // ---- Fallback interactive login ----
      await client.start({
        phoneNumber: async () => await input.text("number ?"),
        password: async () => await input.text("password?"),
        phoneCode: async () => await input.text("Code ?"),
        onError: (err) => console.log(err),
      });
    }
    console.log("Login successful! Saving session to .env file...");
    const newSessionString = client.session.save();
    await KeystoreModel.upsert({ key: "session", value: newSessionString });
    console.log("Session saved. Please restart the bot.");
  }

  await client.connect();
  console.log("Bot is ready.");
  const me = await client.getMe();
  setSudo(me.id);
  require("./bot/index");
  await client.getDialogs();

  for (const module of modules) {
    if (module.on && module.on == "start") {
      module.callback(client);
    }
  }

  await client.sendMessage("me", { message: "Bot has been started.." });
  var commits = await git.log(["main" + "..origin/" + "main"]);
  var mss = "";

  if (commits.total != 0) {
    var changelog = "_Pending updates:_\n\n";
    for (var i in commits.all) {
      changelog += `${parseInt(i) + 1}• **${commits.all[i].message}**\n`;
    }
    changelog += `\n_Use ".update start" to start the update_`;
    await client.sendMessage("me", { message: changelog });
  }

  // Start health server if not already running (for when session exists)
  if (process.env.WEB_LOGIN_ENABLED !== "true" || session) {
    const healthApp = express();
    const PORT = process.env.PORT || 3000;

    // Health check endpoints
    healthApp.get("/", (req, res) => {
      res.json({
        status: "alive",
        message: "Darkbot is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    healthApp.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        bot: "online",
        timestamp: new Date().toISOString(),
      });
    });

    healthApp.listen(PORT, () => {
      console.log(`Health server running on port ${PORT}`);
    });
  }
  
})();

Module(
  { pattern: "start", fromMe: true, desc: "Start command", use: "utility" },
  async (m) => {
    const sender = await m.message.getSender();
    await m.client.sendMessage(sender, {
      message: `Hi, your ID is ${m.message.senderId}`,
    });
  }
);

module.exports = {
  Module,
  modules,
};

(async () => {
  await ExternalPluginsModel.sync();
  let plugins = await ExternalPluginsModel.findAll();
  await plugins.forEach(async (plugin) => {
    const pluginName = plugin.name;
    const pluginUrl = plugin.url;
    if (!fs.existsSync("./plugins/" + pluginName + ".js")) {
      try {
        var url = new URL(pluginUrl);
      } catch {
        console.log("Invalid URL");
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
      } catch (e) {
        console.log(e);
      }

      fs.writeFileSync("./plugins/" + pluginName + ".js", response.data);
    }
  });
  const pluginFolder = "./plugins/";
  const files = fs.readdirSync(pluginFolder);

  files.forEach((file) => {
    if (file.endsWith(".js")) {
      const filePath = pluginFolder + file;
      require(filePath);
    }
  });
})();
