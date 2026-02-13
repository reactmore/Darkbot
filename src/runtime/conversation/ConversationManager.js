const { ConversationBotModel } = require("../../models");

class ConversationManager {

    constructor() {
        this.flows = new Map(); // <flowName, steps[]>
    }

    register(flowName, steps) {
        this.flows.set(flowName, steps);
    }

    async start(userId, botToken, flowName, message) {

        const flow = this.flows.get(flowName);
        if (!flow) return;

        await ConversationBotModel.destroy({
            where: { userId, botToken }
        });

        await ConversationBotModel.create({
            userId,
            botToken,
            step: 0,
            flow: flowName,
            data: JSON.stringify({})
        });

        await this.execute(userId, botToken, message);
    }

    async handle(message, botToken) {

        const session = await ConversationBotModel.findOne({
            where: {
                userId: message.jid,
                botToken
            }
        });

        if (!session) return false;

        await this.execute(message.jid, botToken, message, session);
        return true;
    }

    async execute(userId, botToken, message, existingSession = null) {

        const session = existingSession || await ConversationBotModel.findOne({
            where: { userId, botToken }
        });

        if (!session) return;

        const flow = this.flows.get(session.flow);
        if (!flow) {
            await session.destroy();
            return;
        }

        const stepFn = flow[session.step];
        if (!stepFn) {
            await session.destroy();
            return;
        }

        const data = JSON.parse(session.data || "{}");

        await stepFn(message, { data });

        session.step += 1;
        session.data = JSON.stringify(data);

        if (session.step >= flow.length) {
            await session.destroy();
        } else {
            await session.save();
        }
    }

    async stop(userId, botToken) {
        await ConversationBotModel.destroy({
            where: { userId, botToken }
        });
    }
}

module.exports = new ConversationManager();
