const { DataTypes, Op } = require("sequelize");
const BaseModel = require("./BaseModel");

class KeystoreModel extends BaseModel {
  static init(sequelize) {
    return super.initModel(
      {
        key: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        value: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        tableName: 'keystore',
        modelName: "KeystoreModel",
        timestamps: true,
        freezeTableName: true,
      },
      sequelize
    );
  }

  static associate(models) {

  }
}

module.exports = KeystoreModel;
