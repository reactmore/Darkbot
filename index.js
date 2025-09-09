require("dotenv").config();
const express = require("express");
const { KeystoreModel } = require("./models");
const loginRoutes = require("./routes/login.routes");
const { startQrLogin, startInteractiveLogin } = require("./controllers/login.controller");
const { initBot } = require("./services/bot.service");

(async () => {
  console.log("Darkbot is starting...");
  await KeystoreModel.sync();

  // check session on keystore
  const session = await KeystoreModel.findOne({ where: { key: "session" } });

  const app = express();
  app.use(express.json());
  app.use("/", loginRoutes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  if (!session) {
    if (process.env.WEB_LOGIN_ENABLED?.toLowerCase() === "true") {
      console.log("No session found → waiting for QR login...");
      // don't wait with await → let the server keep running
      startQrLogin()
        .then(async (newSession) => {
          if (newSession) {
            console.log("QR login success → starting bot...");
            await initBot(newSession);
          }
        })
        .catch(err => {
          console.error("QR login failed:", err);
        });
    } else {
      console.log("No session → please run interactive login.");
      // Fallback to interactive login
      startInteractiveLogin()
        .then(async (newSession) => {
          if (newSession) {
            console.log("Interactive login success → starting bot...");
            await initBot(newSession);
          }
        })
        .catch(err => {
          console.error("login failed:", err);
        });
    }
  } else {
    console.log("Session found → starting bot directly...");
    await initBot(session.value);
  }
})();
