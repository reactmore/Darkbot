"use strict";

const { TelegramClient, Api, Logger } = require("teleproto");
const { NewMessage } = require("teleproto/events");
const { LogLevel } = require("teleproto/extensions/Logger");
const EventEmitter = require("events");

/**
 * @extends TelegramClient
 */
class CreateClient extends TelegramClient {
  /**
   * @param {any} stringSession
   * @param {number} apiId
   * @param {string} apiHash
   * @param {object} options
   */
  constructor(stringSession, apiId, apiHash, options = {}) {
    super(stringSession, apiId, apiHash, {
      connectionRetries: 5,
      baseLogger: new Logger(LogLevel.ERROR),
      ...options,
    });
    this.event = new EventEmitter();
    this.addEventHandler((event) => {
      let message = new Message(this, event.message);
      const type = message.quoted
        ? `${message.jid}-quoted-${message.quoted}`
        : `${message.jid}-message`;

      this.event.emit(type, message);
    }, new NewMessage({}));
  }

  /**
   * Get user profile photos
   * @param {number|string} userId
   */
  async getUserProfilePhotos(userId) {
    const result = await this.invoke(
      new Api.photos.GetUserPhotos({
        userId,
        offset: 0,
      })
    );

    return result.photos;
  }

  /**
   * Send upload document typing action
   * @param {number|string} jid
   */
  async uploadDocumentAction(jid) {
    return await this.invoke(
      new Api.messages.SetTyping({
        peer: jid,
        action: new Api.SendMessageUploadDocumentAction(),
      })
    );
  }

  /**
   * Cancel typing/upload action
   * @param {number|string} jid
   */
  async cancelAction(jid) {
    return await this.invoke(
      new Api.messages.SetTyping({
        peer: jid,
        action: new Api.SendMessageCancelAction(),
      })
    );
  }
}

async function createBot(apiId, apiHash, botToken, stringSession, options = {}) {
  const client = new CreateClient(stringSession, apiId, apiHash, options);

  await client.start({
    botAuthToken: botToken,
  });

  return client;
}

module.exports = {
  CreateClient,
  createBot,
};
