async function getClientState(req) {
    try {
        if (!req.tgClient || !req.tgUser) {
            return { status: "UNAUTHORIZED", message: "No active client in request" };
        }

        const me = await req.tgClient.getMe();

        if (me) {
            return {
                status: "LOGGED_IN",
                message: `Connected as ${me.username || me.firstName}`,
            };
        }

        return { status: "UNKNOWN", message: "Client exists but no user info" };
    } catch (err) {
        if (err.message.includes("AUTH_KEY_UNREGISTERED")) {
            return { status: "UNAUTHORIZED", message: "Session expired or invalid" };
        }
        return { status: "ERROR", message: err.message };
    }
}

async function getHomePage(req, res) {
    return res.json({
        status: "alive",
        message: "Darkbot is running",
        timestamp: new Date().toISOString(),
    });
}

async function getHealth(req, res) {
    try {
        console.log(req.tgUser);
        const clientState = await getClientState(req);
        res.json({
            success: true,
            status: clientState.status,
            message: clientState.message,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'A server error has occurred',
            error: err.message
        });
    }
}

module.exports = {
    getHealth,
    getHomePage,
};
