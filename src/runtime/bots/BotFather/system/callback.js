const fs = require("fs");
const path = require("path");
const { ExternalBotModel, BotModel } = require("../../../../models");

const botsRoot = path.join(__dirname, "../../../bots");

module.exports = {
    on: "callback_query",

    callback: async (m) => {

        // =========================
        // REMOVE
        // =========================
        if (m.query.startsWith("removebot-")) {

            const name = m.query.split("-")[1];

            const external = await ExternalBotModel.findOne({
                where: { name }
            });

            if (!external) return await m.send("Bot not found");

            await BotModel.destroy({
                where: { token: external.token }
            });

            await external.destroy();

            const folderPath = path.join(botsRoot, name);

            if (fs.existsSync(folderPath)) {
                fs.rmSync(folderPath, { recursive: true, force: true });
            }

            await m.answer();
            await m.send("Bot removed.");
            await m.send("Restarting runtime...");

            process.exit(1);
        }

        // =========================
        // UPDATE
        // =========================
        if (m.query.startsWith("updatebot-")) {

            const name = m.query.split("-")[1];

            const folderPath = path.join(botsRoot, name);

            if (fs.existsSync(folderPath)) {
                fs.rmSync(folderPath, { recursive: true, force: true });
            }

            await m.answer();
            await m.send("Bot updating...");
            await m.send("Restarting runtime...");

            process.exit(1); 
        }
    }
};
