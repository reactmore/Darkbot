const { botHandler } = require("../handler");
const { BOT_TOKEN } = require("../../config");
const { startCommand, pingCommand } = require("../utils/defaultCommands");
const { addbotCommand, updatebotCommand, removebotCommand, handleCallbackQueryBotManager, handleIncomingMessageBotManager } = require("../commands/BotManagerCommand");

botHandler({
  name: "BotFather",
  BOT_TOKEN,
  commands: [
    pingCommand,
    startCommand,
    addbotCommand,
    updatebotCommand,
    removebotCommand,
    {
      on: "message",
      sudo: true,
      callback: handleIncomingMessageBotManager,
    },
    {
      on: "message",
      sudo: true,
      callback: async (m) => {
        let text = m.message;
        if (text.startsWith("<")) {
          const util = require("util");
          try {
            let return_val = await eval(
              `(async () => { ${text.replace("<", "")} })()`
            );
            if (return_val && typeof return_val !== "string")
              return_val = util.inspect(return_val);
            if (return_val) {
              await m.client.sendMessage(m.jid, {
                message: return_val || "no return value",
              });
            }
          } catch (e) {
            await m.client.sendMessage(m.jid, {
              message: util.format(e),
            });
          }
        }
      },
    },
    {
      on: "callback_query",
      callback: async (m) => {
        const queryData = m.query; // The query string from the callback
        const callbackData = new URLSearchParams(queryData); // Parse the query string
        const command = callbackData.get('command'); // Get the 'command' parameter

        switch (command) {
          case 'botmanager':
            await handleCallbackQueryBotManager(m, callbackData);
            break;
          default:
            await defaultCallbackQuery(m, callbackData);
        }
      },
    },
  ],
});

async function defaultCallbackQuery(m, callbackData) {
  await m.answer();
}

async function timeoutMessage(m) {
  await m.send("Time out");
  state = false;
}
