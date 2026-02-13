const { botHandler } = require("../handler");
const { startCommand, pingCommand } = require("../utils/defaultCommands");
botHandler({
  name: "ping",
  BOT_TOKEN:"7879360786:AAHbG9RLMDuFxyio9vA0gFWc_cLTvBBd-8Q",
  commands: [
    pingCommand,
    startCommand,
    {
      on:"inline_query",
      callback:async (event,client)=>{
        const query = event.query;
        await client.invoke(
          new Api.messages.SetInlineBotResults({
            queryId: event.queryId,
            results: [
              new Api.InputBotInlineResult({
                id: "1",
                title: "title",
                description: "description",
                type: "article",
                sendMessage: new Api.InputBotInlineMessageText({
                  message: "Hello world",
                }),
              }),
            ],
          })
        )
      
      }
    }
  ],
});
