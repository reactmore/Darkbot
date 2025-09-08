'use strict';

const fs = require('fs');
const path = require('path');
const { sequelize, Sequelize } = require('../config/database');
const models = {};

fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && !['index.js', 'BaseModel.js'].includes(file))
  .forEach(file => {
    const modelClass = require(path.join(__dirname, file));
    const model = modelClass.init(sequelize);
    models[modelClass.name || file.replace('.js', '')] = model;
  });

Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;

