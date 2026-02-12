const express = require("express");

function startHealthServer(session) {
    // Jangan start kalau sudah ditangani login web
    if (process.env.WEB_LOGIN_ENABLED === "true" && !session) {
        return;
    }

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.get("/", (req, res) => {
        res.json({
            status: "alive",
            message: "Darkbot is running",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });

    app.get("/health", (req, res) => {
        res.json({
            status: "healthy",
            bot: "online",
            timestamp: new Date().toISOString(),
        });
    });

    app.listen(PORT, () => {
        console.log(`Health server running on port ${PORT}`);
    });
}

module.exports = {
    startHealthServer,
};
