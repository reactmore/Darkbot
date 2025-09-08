const { DataTypes, Op } = require("sequelize");
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
          type: DataTypes.STRING,
          allowNull: false,
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

  }
}

module.exports = BotModel;
