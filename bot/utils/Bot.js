const { StringSession } = require("telegram/sessions");
const BotDb = require("../../modals/bot");
const { createBot } = require("../../lib/createClient");
const Message = require("../../lib/Message");
const { NewMessage } = require("telegram/events");
const { Api } = require("telegram");


class Bot {
  constructor(apiId, apiHash, BOT_TOKEN, name) {
    this.apiId = apiId;
    this.apiHash = apiHash;
    this.BOT_TOKEN = BOT_TOKEN;
    this.name = name;
    this.modules = [];
  }
  async init() {
      console.log(`${this.name} is starting...`);
    await BotDb.sync();
    let session = "";
    const bot = await BotDb.findOne({ where: { token: this.BOT_TOKEN } });
    if (bot) session = bot.session;
    const stringSession = new StringSession(session);

    this.client = await createBot(this.apiId, this.apiHash, this.BOT_TOKEN, stringSession);
    await this.setCommands();
    console.log(`${this.name} is started!`);
    session = this.client.session.save();
    if (!bot) this.saveSession(BOT_TOKEN, session);
    this.client.addEventHandler(async (event) => {
      let test = new Message(this.client, event.message);
      for (let i of this.modules) {
        const regex = new RegExp(`^\/\\s*${i.pattern} ?(.*)`);
        const match = event.message?.message?.match(regex);

        if (match) {
          i.callback(test, match);
        }
      }
    }, new NewMessage({}));
  }
  addCommand(command) {
    this.modules.push(command);
  }
  async saveSession(token, session) {
    await BotDb.create({ token, session });
  }
  async setCommands(){
    const commands = []
    for(let i of this.modules){
        commands.push(new Api.BotCommand({
            command:i.pattern,
            description:i.description || ""
        }))
    }
    await this.client.invoke(
      new Api.bots.SetBotCommands({
        scope: new Api.BotCommandScopeDefault(),
        langCode: "en",
        commands
      })
    );
  }
}

exports.Bot = Bot;
