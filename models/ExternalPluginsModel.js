const { DataTypes, Op } = require("sequelize");
const BaseModel = require("./BaseModel");

class ExternalPluginsModel extends BaseModel {
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
        }
      },
      {
        tableName: 'external_plugins',
        modelName: "ExternalPluginsModel",
        timestamps: true,
        freezeTableName: true,
      },
      sequelize
    );
  }

  static associate(models) {

  }
}

module.exports = ExternalPluginsModel;
