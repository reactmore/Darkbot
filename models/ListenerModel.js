const { DataTypes } = require('sequelize');
const BaseModel = require('./BaseModel');
const { DATABASE } = require('../config');

class ListenerModel extends BaseModel {}


ListenerModel.init({
    app_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    get_id: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    forward_id: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'stopped'),
        allowNull: true,
    }
}, {
    sequelize: DATABASE,
    tableName: 'Listener',
    modelName: 'Listener',
    freezeTableName: true,
    timestamps: true,
    indexes: [
        {
            unique: false, // Set to true if you want a unique index
            fields: ['app_id', 'status'],
        },
    ],
});

module.exports = ListenerModel;