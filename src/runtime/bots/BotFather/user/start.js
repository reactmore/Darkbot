module.exports = {
    pattern: "start",
    description: "Start command",
    callback: async (m, match, botInstance) => {
        let msg = "Bot is started!\n\nCommands:\n";

        for (let cmd of botInstance.commands) {
            if (cmd.pattern && cmd.description) {
                msg += `/${cmd.pattern} - ${cmd.description}\n`;
            }
        }

        await m.send(msg);
    }
};
