const { DataTypes } = require('sequelize');
const BaseModel = require('./BaseModel');
const { DATABASE } = require('../config');

class BotModel extends BaseModel { }


BotModel.init({
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    session: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize: DATABASE,
    tableName: 'Bot',
    modelName: 'Bot',
    freezeTableName: true,
});

module.exports = BotModel;