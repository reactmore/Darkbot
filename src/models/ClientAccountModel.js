const { DataTypes } = require("sequelize");
const BaseModel = require("./BaseModel");

class ClientAccountModel extends BaseModel {
    static init(sequelize) {
        return super.initModel(
            {
                phone: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },

                session: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },

                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                },

                isMain: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                }
            },
            {
                tableName: 'client_account',
                modelName: "ClientAccountModel",
                timestamps: true,
                freezeTableName: true,
            },
            sequelize
        );
    }

    static associate(models) {
        this.hasMany(models.BotModel, {
            foreignKey: 'clientId',
            onDelete: 'CASCADE'
        });

        this.hasMany(models.ExternalBotModel, {
            foreignKey: 'clientId',
            onDelete: 'CASCADE'
        });
    }
}

module.exports = ClientAccountModel;
