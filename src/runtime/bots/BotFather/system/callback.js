const fs = require("fs");
const path = require("path");
const { ExternalBotModel, BotModel } = require("../../../../models");

module.exports = {
    on: "callback_query",

    callback: async (m) => {

        // REMOVE
        if (m.query.startsWith("removebot-")) {

            const name = m.query.split("-")[1];

            const external = await ExternalBotModel.findOne({
                where: { name }
            });

            if (!external) return await m.send("Bot not found");

            const token = external.token;

            await external.destroy();
            await BotModel.destroy({ where: { token } });

            const filePath = path.join(__dirname, "..", name + ".js");

            if (fs.existsSync(filePath)) {
                delete require.cache[require.resolve(filePath)];
                fs.unlinkSync(filePath);
            }

            await m.answer();
            await m.send("Bot removed.");
            await m.send("Restarting runtime...");
            process.exit(1);
        }

        // UPDATE
        if (m.query.startsWith("updatebot-")) {

            const name = m.query.split("-")[1];

            const filePath = path.join(__dirname, "..", name + ".js");

            if (fs.existsSync(filePath)) {
                delete require.cache[require.resolve(filePath)];
                fs.unlinkSync(filePath);
            }

            await m.answer();
            await m.send("Bot updating...");
            process.exit(1);
        }
    }
};
