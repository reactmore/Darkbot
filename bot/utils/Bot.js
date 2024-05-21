const { StringSession } = require("telegram/sessions");
const BotModel = require("../../models/BotModel");
const { createBot } = require("../../lib/createClient");
const Message = require("../../lib/Message");
const { NewMessage, Raw } = require("telegram/events");
const { CallbackQuery } = require("telegram/events/CallbackQuery");
const { Api } = require("telegram");
const { getSudo, DEVELOPMENT } = require("../../config");
const { apiId, apiHash } = require("../../config");
const { Callback } = require("./Callback");

class Bot {
  constructor(BOT_TOKEN, name) {
    this.BOT_TOKEN = BOT_TOKEN;
    this.name = name;
    this.modules = [];
  }
  async init() {
    console.log(`${this.name} Father is starting...`);
    await BotModel.sync();

    let session = "";

    const bot = await BotModel.findOne({ where: { token: this.BOT_TOKEN } });

    if (bot) session = bot.session;

    const stringSession = new StringSession(session);

    this.client = await createBot(
      apiId,
      apiHash,
      this.BOT_TOKEN,
      stringSession
    );

    await this.setCommands();

    console.log(`${this.name} started!`);

    for (let module of this.modules) {
      if (module.on && module.on == "start" && module.callback) module.callback(this.client)
    }

    try {
      if (!DEVELOPMENT) this.client.send(getSudo(), { text: `${this.name} started!` })
    } catch (error) {
      console.log(error);
    }
    
    session = this.client.session.save();
    
    if (!bot) this.saveSession(this.BOT_TOKEN, session);
    
    this.client.addEventHandler(async (event) => {
      let test = new Message(this.client, event.message);
      for (let i of this.modules) {
        if (i.pattern && ((i.sudo && getSudo() == test.jid) || !i.sudo)) {
          const regex = new RegExp(`^\/\\s*${i.pattern} ?(.*)`);
          const match = event.message?.message?.match(regex);

          if (match) {
            i.callback(test, match, this);
          }
        }
        if (
          i.on &&
          i.on == "message" &&
          ((i.sudo && getSudo() == test.jid) || !i.sudo)
        ) {
          i.callback(test, [], this);
        }
      }
    }, new NewMessage({}));
    
    this.client.addEventHandler(async (event) => {
      const callback = new Callback(this.client, event.query);
      for (let module of this.modules) {
        if (module.on && module.on == "callback_query" && module.callback) {
          module.callback(callback, this.client)
        }
      }
    }, new CallbackQuery({}));
    
    await this.client.getMe();
    
    this.client.addEventHandler((event) => {
      if (event instanceof Api.UpdateBotInlineQuery) {
        for (let module of this.modules) {
          if (module.on && module.on == "inline_query" && module.callback) {
            module.callback(event, this.client)
          }
        }
      }
    }, new Raw({}))
  }

  addCommand(command) {
    this.modules.push(command);
  }

  async saveSession(token, session) {
    await BotModel.create({ token, session });
  }

  async setCommands() {
    const commands = [];
    for (let i of this.modules) {
      if (i.pattern && i.description && !i.dontAdd) {
        commands.push(
          new Api.BotCommand({
            command: i.pattern,
            description: i.description,
          })
        );
      }
    }
    await this.client.invoke(
      new Api.bots.SetBotCommands({
        scope: new Api.BotCommandScopeDefault(),
        langCode: "en",
        commands,
      })
    );
  }
}

exports.Bot = Bot;
