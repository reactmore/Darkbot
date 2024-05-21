const BaseModel = require('./BaseModel');
const { DataTypes } = require('sequelize');
const { DATABASE } = require('../config');

class ExternalPluginModel extends BaseModel {
    // Custom methods specific to BotModel can be added here
}

ExternalPluginModel.init({
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: DATABASE,
    tableName: 'ExternalPlugin',
    modelName: 'ExternalPlugin',
});

module.exports = ExternalPluginModel;
