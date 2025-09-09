const { KeystoreModel } = require("../models");

async function checkSession(req, res, next) {
    const session = await KeystoreModel.findOne({ where: { key: "session" } });
    if (!session || !session.value) {
        return next(); 
    }
    return res.json({
        status: "alive",
        message: "Already logged in",
        timestamp: new Date().toISOString(),
    });
}

module.exports = { checkSession };
