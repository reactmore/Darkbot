class ConversationManager {
    constructor() {
        this.sessions = new Map();
    }

    start(userId, flow) {
        this.sessions.set(userId, {
            step: 0,
            flow,
            data: {}
        });
    }

    async handle(message) {
        const session = this.sessions.get(message.jid);
        if (!session) return false;

        const current = session.flow[session.step];
        if (!current) {
            this.sessions.delete(message.jid);
            return false;
        }

        await current(message, session);

        session.step++;

        if (session.step >= session.flow.length) {
            this.sessions.delete(message.jid);
        }

        return true;
    }

    stop(userId) {
        this.sessions.delete(userId);
    }
}

module.exports = new ConversationManager();
