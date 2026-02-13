const fs = require("fs");
const path = require("path");

const { getBotDefinitions } = require("./registry/commandRegistry");
const { loadExternalBots } = require("./loader/ExternalBotLoader");
const BotManager = require("./manager/BotManager");

(async () => {
  console.log("Bot Runtime starting...");

  // 1️⃣ LOAD LOCAL BOTS (BotFather dll)
  const botsPath = path.join(__dirname, "bots");

  const folders = fs.readdirSync(botsPath);

  for (const folder of folders) {
    const indexFile = path.join(botsPath, folder, "index.js");

    if (fs.existsSync(indexFile)) {
      require(indexFile);
    }
  }

  // 2️⃣ LOAD EXTERNAL BOTS
  await loadExternalBots();

  // 3️⃣ GET DEFINITIONS
  const definitions = getBotDefinitions();

  if (!definitions.length) {
    console.log("No bot definitions found.");
    return;
  }

  // 4️⃣ START
  await BotManager.startAll(definitions);

  console.log("Bot Runtime ready.");
})();
