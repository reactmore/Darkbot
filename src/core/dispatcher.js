const { NewMessage } = require("teleproto/events");
const Message = require("../lib/Message");
const { modules } = require("./moduleRegistry");

/**
 * @param {import('teleproto').TelegramClient} client
 */
function registerDispatcher(client) {

    client.addEventHandler(
        /**
         * @param {import('teleproto').Api.TypeUpdate} event
         */
        async (event) => {

            if (!event.message) return;

            /** @type {import('../lib/Message')} */
            const test = new Message(client, event.message);

            const message = event.message.message;
            const sender = await event.message.getSender();

            // COMMAND HANDLER
            if (message) {
                for (const module of modules) {
                    if (!module.pattern) continue;

                    if ((module.fromMe && sender.self) || !module.fromMe) {
                        const regex = new RegExp(`^\\.\\s*${module.pattern}`);
                        const match = message.match(regex);

                        if (match) {
                            await module.callback(test, match);
                        }
                    }
                }
            }

            // EVENT HANDLER (on: message)
            for (const module of modules) {
                if (
                    module.on === "message" &&
                    ((module.fromMe && sender.self) || !module.fromMe)
                ) {
                    await module.callback(test);
                }
            }
        },
        new NewMessage({})
    );
}

module.exports = {
    registerDispatcher,
};
