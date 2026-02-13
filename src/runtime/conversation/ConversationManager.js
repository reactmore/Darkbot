const { ConversationBotModel } = require("../../models");

class ConversationManager {

    constructor() {
        this.flows = new Map();
    }

    register(flowName, steps) {
        this.flows.set(flowName, steps);
    }

    async start(userId, botToken, flowName, message) {

        const flow = this.flows.get(flowName);
        if (!flow) return;

        // deactivate old
        await ConversationBotModel.update(
            { active: false, completedAt: new Date() },
            { where: { userId, botToken, active: true } }
        );

        const session = await ConversationBotModel.create({
            userId,
            botToken,
            step: 0,
            flow: flowName,
            data: JSON.stringify({}),
            active: true
        });

        await this.execute(session, message);
    }

    async handle(message, botToken) {

        const session = await ConversationBotModel.findOne({
            where: {
                userId: message.jid,
                botToken,
                active: true
            }
        });

        if (!session) return false;

        await this.execute(session, message);
        return true;
    }

    async execute(session, message) {

        if (!session.active) return;

        const flow = this.flows.get(session.flow);
        if (!flow) {
            await this.finish(session);
            return;
        }

        const stepFn = flow[session.step];
        if (!stepFn) {
            await this.finish(session);
            return;
        }

        const data = JSON.parse(session.data || "{}");

        await stepFn(message, { data, session });

        session.step += 1;
        session.data = JSON.stringify(data);

        if (session.step >= flow.length) {
            await this.finish(session);
        } else {
            await session.save();
        }
    }

    async finish(session) {
        session.active = false;
        session.completedAt = new Date();
        await session.save();
    }

    async stop(userId, botToken) {

        await ConversationBotModel.update(
            { active: false, completedAt: new Date() },
            { where: { userId, botToken, active: true } }
        );
    }

    async hasActive(userId, botToken) {
        const session = await ConversationBotModel.findOne({
            where: { userId, botToken, active: true }
        });
        return !!session;
    }
}

module.exports = new ConversationManager();
