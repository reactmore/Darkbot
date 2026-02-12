"use strict";

const { Api } = require("teleproto");

/**
 * @typedef {import('teleproto').TelegramClient} TelegramClient
 */

class Base {

  /**
   * @param {TelegramClient} client
   */
  constructor(client) {
    /** @type {TelegramClient} */
    this.client = client;
  }

  _clone() {
    return Object.assign(Object.create(this), this);
  }

  _patch(data) {
    return data;
  }

  /**
   * @param {any} params
   */
  async edit(params) {
    return await this.data.edit(params);
  }

  /**
   * @param {number|string} [id]
   */
  async getUsername(id = this.jid) {
    const entity = await this.client.getEntity(id);
    return entity?.username;
  }

  /**
   * ⚠ Fixed broken variable reference
   * @param {number} messageId
   */
  async updateGroupImage(messageId) {
    try {
      const messages = await this.client.getMessages(this.jid, {
        ids: messageId,
      });

      if (messages?.[0]?.media?.photo) {
        await this.client.invoke(
          new Api.channels.EditPhoto({
            channel: await this.getUsername(),
            photo: messages[0].media.photo,
          })
        );
      }
    } catch (e) {
      throw e;
    }
  }

  async forwardMessage(to) {
    return await this.data.forwardTo(to);
  }

  async changeGroupTitle(username, text) {
    await this.client.invoke(
      new Api.channels.EditTitle({
        channel: username,
        title: text,
      })
    );
  }

  async send(text, options = {}) {
    return await this.client.sendMessage(this.jid, {
      message: text,
      ...options,
    });
  }

  async react(emoji = "👍", id = this.id) {
    return await this.client.invoke(
      new Api.messages.SendReaction({
        peer: this.jid,
        msgId: id,
        reaction: [new Api.ReactionEmoji({ emoticon: emoji })],
      })
    );
  }

  async delete(params = { revoke: true }) {
    return await this.data.delete(params);
  }

  async reply(params) {
    return await this.data.reply(params);
  }
}

module.exports = Base;
