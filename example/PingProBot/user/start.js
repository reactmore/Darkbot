module.exports = {
    pattern: "start",
    description: "Start command",

    callback: async (m) => {
        await m.send("PingProBot running 🚀");
    }
};
