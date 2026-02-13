const ConversationManager = require("../../../conversation/ConversationManager");

module.exports = {
    pattern: "cancel",
    description: "Cancel active conversation",

    callback: async (m, match, botInstance) => {

        const active = await ConversationManager.hasActive(
            m.jid,
            botInstance.token
        );

        if (!active) {
            return await m.send("No active conversation.");
        }

        await ConversationManager.stop(
            m.jid,
            botInstance.token
        );

        await m.send("Conversation cancelled.");
    }
};
