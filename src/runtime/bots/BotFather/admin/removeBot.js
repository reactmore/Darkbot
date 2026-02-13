const { ExternalBotModel, BotModel } = require("../../../../models");
const { ButtonBuilder } = require("../../../utils/buttonBuilder");
const { Button } = require("teleproto/tl/custom/button");

module.exports = {
    pattern: "removebot",
    description: "Remove external bot",
    admin: true,

    callback: async (m) => {

        const bots = await ExternalBotModel.findAll();
        if (!bots.length) return await m.send("No external bots found");

        const btn = new ButtonBuilder();

        for (const bot of bots) {
            btn.add([
                Button.inline(bot.name, Buffer.from("removebot-" + bot.name))
            ]);
        }

        await m.client.sendMessage(m.jid, {
            message: "Select bot to remove",
            buttons: btn.build()
        });
    }
};
