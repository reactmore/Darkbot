module.exports = {
    pattern: "ping",
    description: "Ping command",
    callback: async (m) => {
        const start = Date.now();
        await m.send("Testing...");
        await m.send(`Latency: ${Date.now() - start}ms`);
    }
};
