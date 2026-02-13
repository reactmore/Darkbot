const { ExternalBotModel } = require("../../../../models");
const { ButtonBuilder } = require("../../../utils/buttonBuilder");
const { Button } = require("teleproto/tl/custom/button");

module.exports = {
    pattern: "updatebot",
    description: "Update external bot",
    admin: true,

    callback: async (m) => {

        const bots = await ExternalBotModel.findAll({
            where: { isActive: true }
        });

        if (!bots.length) return await m.send("No external bots found");

        const btn = new ButtonBuilder();

        for (const bot of bots) {
            btn.add([
                Button.inline(bot.name, Buffer.from("updatebot-" + bot.name))
            ]);
        }

        await m.client.sendMessage(m.jid, {
            message: "Select bot to update",
            buttons: btn.build()
        });
    }
};
