const BaseModel = require('./BaseModel');
const { DataTypes } = require('sequelize');
const { DATABASE } = require('../config');

class ExternalBotsModel extends BaseModel {
    // Custom methods specific to BotModel can be added here
}

ExternalBotsModel.init({
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
}, {
    sequelize: DATABASE,
    tableName: 'ExternalBot',
    modelName: 'ExternalBot',
});

module.exports = ExternalBotsModel;
