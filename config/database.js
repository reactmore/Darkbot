require("dotenv").config();
const { Sequelize } = require('sequelize');

let sequelize;
if (process.env.DATABASE_URL === 'sqlite') {
    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: "./bot.db",
        logging: false,
    });
} else if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        logging: false,
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false },
        },
    });
} else {
    sequelize = new Sequelize(
        process.env.DB_DATABASE,
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST || "127.0.0.1",
            port: process.env.DB_PORT || 3306,
            dialect: "mysql",
            logging: false,
            dialectOptions: { bigNumberStrings: true },
            define: { freezeTableName: true },
        }
    );
}


module.exports = { sequelize, Sequelize };

