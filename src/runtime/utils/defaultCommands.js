const startCommand = {
  pattern: "start",
  description: "Start command",
  callback: async (message, match, botInstance) => {
    let msg = "Bot is started!\n\nCommands:\n";

    for (let cmd of botInstance.commands) {
      if (cmd.pattern && cmd.description) {
        msg += `/${cmd.pattern} - ${cmd.description}\n`;
      }
    }

    await message.send(msg);
  },
};

const pingCommand = {
  pattern: "ping",
  description: "Ping command",
  callback: async (m, match, botInstance) => {
    const start = Date.now();
    await m.send("Testing...");
    const end = Date.now();
    await m.send(`Latency: ${end - start} ms`);
  },
};

module.exports = { startCommand, pingCommand };
