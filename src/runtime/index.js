const { getBotDefinitions } = require("./registry/commandRegistry");
const { loadExternalBots } = require("./loader/ExternalBotLoader");
const BotManager = require("./manager/BotManager");

(async () => {
  console.log("Bot Runtime starting...");

  await loadExternalBots();

  const definitions = getBotDefinitions();

  await BotManager.startAll(definitions);

  console.log("Bot Runtime ready.");
})();
