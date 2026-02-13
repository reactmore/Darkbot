const { createUrlFile, createBufferFile } = require("../media/fileFactory");

/**
 * Attach extended methods to client instance
 * @param {import('teleproto').TelegramClient} client
 */
function extendClient(client) {

    client.getReplyMessage = function (jid, quoted = false) {
        const type = quoted ? `${jid}-quoted-${quoted}` : `${jid}-message`;

        return new Promise((resolve) => {
            client.event.once(type, (message) => {
                resolve(message);
            });
        });
    };

    client.send = async function (id, obj, options = {}) {
        try {
            if (obj.text) {
                return await this.sendMessage(id, {
                    message: obj.text,
                });
            } else if (obj.image) {
                if (obj.image.url) {
                    await this.sendFile(id, { file: await createUrlFile(obj.image.url) });
                } else {
                    await this.sendFile(id, { file: await createBufferFile(obj.image) });
                }
            } else if (obj.video) {
                if (obj.video.url) {
                    return await this.sendFile(id, {
                        file: await createUrlFile(obj.video.url, "video"),
                    });
                } else {
                    return await this.sendFile(id, {
                        file: await createBufferFile(obj.video, "video"),
                    });
                }
            } else if (obj.document) {
                if (obj.document.url) {
                    const result = new CustomFile(
                        obj.fileName,
                        fs.statSync(obj.document.url).size,
                        obj.document.url
                    );
                    return await this.sendFile(id, {
                        file: result,
                        forceDocument: true,
                        workers: 10,
                        ...options,
                    });
                } else {
                    const result = new CustomFile(
                        obj.fileName,
                        obj.document.length,
                        "",
                        obj.document
                    );
                    return await this.sendFile(id, {
                        file: result,
                        forceDocument: true,
                        workers: 10,
                        ...options,
                    });
                }
            } else {
                console.log("invalid format");
            }
        } catch (e) {
            throw e;
        }
    };

    return client;
}

module.exports = {
    extendClient,
};
