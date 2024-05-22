const { DataTypes } = require('sequelize');
const BaseModel = require('./BaseModel');
const { DATABASE } = require('../config');

class ConversationModel extends BaseModel {

    /**
         * Select a conversation from the DB
         *
         * @param {number} userId
         * @param {number} chatId
         * @param {number} limit
         *
         * @return {Promise<Array|boolean>}
         */
    static async selectConversation(userId, chatId, limit = 0) {
        try {
            const options = {
                where: {
                    status: 'active',
                    user_id: userId,
                    chat_id: chatId
                },
                order: [['createdAt', 'DESC']]
            };

            if (limit > 0) {
                options.limit = limit;
            }

            const conversations = await this.findAll(options);
            return conversations;
        } catch (error) {
            throw new Error('Error selecting conversation: ' + error.message);
        }
    }

    /**
     * Insert the conversation in the database
     *
     * @param {number} userId
     * @param {number} chatId
     * @param {string} command
     *
     * @return {Promise<boolean>}
     */
    static async insertConversation(userId, chatId, command) {
        try {
            const date = new Date();

            await this.create({
                status: 'active',
                user_id: userId,
                chat_id: chatId,
                command: command,
                notes: '[]',
                createdAt: date,
                updatedAt: date
            });

            return true;
        } catch (error) {
            throw new Error('Error inserting conversation: ' + error.message);
        }
    }

    /**
     * Update a specific conversation
     *
     * @param {Object} fieldsValues
     * @param {Object} whereFieldsValues
     *
     * @return {Promise<boolean>}
     */
    static async updateConversation(fieldsValues, whereFieldsValues) {
        try {
            // Auto update the updated_at field
            fieldsValues.updatedAt = new Date();

            await this.update(fieldsValues, {
                where: whereFieldsValues
            });

            return true;
        } catch (error) {
            throw new Error('Error updating conversation: ' + error.message);
        }
    }

}


ConversationModel.init({
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    chat_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'cancelled', 'stopped'),
        allowNull: false,
    },
    command: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: DATABASE,
    tableName: 'Conversation',
    modelName: 'Conversation',
    freezeTableName: true,
    timestamps: true,
    indexes: [
        {
            unique: false, // Set to true if you want a unique index
            fields: ['user_id', 'chat_id', 'status'],
        },
    ],
});

module.exports = ConversationModel;