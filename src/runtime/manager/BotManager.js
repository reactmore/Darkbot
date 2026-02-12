const BotInstance = require("./BotInstance");

class BotManager {
    constructor() {
        this.instances = [];
    }

    async startAll(definitions) {
        for (const def of definitions) {
            const instance = new BotInstance(def);
            await instance.start();
            this.instances.push(instance);

            await new Promise((r) => setTimeout(r, 2000));
        }
    }
}

module.exports = new BotManager();
