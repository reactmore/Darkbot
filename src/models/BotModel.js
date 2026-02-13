const { DataTypes } = require("sequelize");
const BaseModel = require("./BaseModel");

class BotModel extends BaseModel {
  static init(sequelize) {
    return super.initModel(
      {
        token: {
          type: DataTypes.STRING,
          allowNull: false
        },

        session: {
          type: DataTypes.TEXT,
          allowNull: false,
        },

        clientId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        }
      },
      {
        tableName: 'bot',
        modelName: "BotModel",
        timestamps: true,
        freezeTableName: true,
      },
      sequelize
    );
  }

  static associate(models) {
    this.belongsTo(models.ClientAccountModel, {
      foreignKey: 'clientId'
    });
  }
}

module.exports = BotModel;
