const { Api } = require("teleproto");

module.exports = {
    on: "inline_query",

    callback: async (event, client) => {

        await client.invoke(
            new Api.messages.SetInlineBotResults({
                queryId: event.queryId,
                results: [
                    new Api.InputBotInlineResult({
                        id: "1",
                        type: "article",
                        title: "Inline OK",
                        description: "PingProBot inline working",
                        sendMessage: new Api.InputBotInlineMessageText({
                            message: "Inline response from PingProBot 👋"
                        })
                    })
                ]
            })
        );
    }
};
