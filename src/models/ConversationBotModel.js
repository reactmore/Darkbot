const { DataTypes, Op } = require("sequelize");
const BaseModel = require("./BaseModel");

class ConversationBotModel extends BaseModel {
    static init(sequelize) {
        return super.initModel(
            {
                userId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                botToken: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                step: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0
                },
                flow: {
                    type: DataTypes.STRING,
                    allowNull: false
                },

                data: {
                    type: DataTypes.TEXT,
                    allowNull: true
                }
            },
            {
                tableName: 'conversation_bot',
                modelName: "ConversationBotModel",
                timestamps: true,
                freezeTableName: true,
            },
            sequelize
        );
    }

    static associate(models) {

    }
}

module.exports = ConversationBotModel;
