require("dotenv").config(); 
const { Sequelize } = require('sequelize');
const path = require("path");

const DB_PATH = path.join(
    __dirname,
    "..",
    "storage",
    "database",
    "bot.db"
);

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: DB_PATH,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      bigNumberStrings: true,
    },
  }
};
