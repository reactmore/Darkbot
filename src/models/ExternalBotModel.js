const { DataTypes } = require("sequelize");
const BaseModel = require("./BaseModel");

class ExternalBotModel extends BaseModel {
  static init(sequelize) {
    return super.initModel(
      {
        url: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        token: {
          type: DataTypes.STRING,
          allowNull: false,
        },

        sourceType: {
          type: DataTypes.ENUM("gist", "repo"),
          allowNull: false,
        },

        branch: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: "main",
        },

        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        }
      },
      {
        tableName: 'external_bot',
        modelName: "ExternalBotModel",
        timestamps: true,
        freezeTableName: true,
      },
      sequelize
    );
  }

  static associate(models) {}
}

module.exports = ExternalBotModel;
