const { botHandler } = require("../../handler");
const { Api } = require("teleproto");

botHandler({
  name: "PingExternalBot",
  BOT_TOKEN:"7879360786:AAHbG9RLMDuFxyio9vA0gFWc_cLTvBBd-8Q",
  commands: [

    // =========================
    // START
    // =========================
    {
      pattern: "start",
      description: "Start command",
      callback: async (m) => {
        console.log(m);
        await m.send("External bot is running 🚀");
      }
    },

    // =========================
    // PING
    // =========================
    {
      pattern: "ping",
      description: "Ping test",
      callback: async (m) => {
        const start = Date.now();
        await m.send("Testing ping...");
        const end = Date.now();
        await m.send(`Latency: ${end - start} ms`);

      }
    },

    // =========================
    // INLINE QUERY
    // =========================
    {
      on: "inline_query",
      callback: async (event, client) => {

        await client.invoke(
          new Api.messages.SetInlineBotResults({
            queryId: event.queryId,
            results: [
              new Api.InputBotInlineResult({
                id: "1",
                type: "article",
                title: "Hello",
                description: "Inline result working",
                sendMessage: new Api.InputBotInlineMessageText({
                  message: "Hello from external bot 👋"
                })
              })
            ]
          })
        );

      }
    }

  ]
});
