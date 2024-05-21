require("dotenv").config();
const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL === undefined ? './bot.db' : process.env.DATABASE_URL;


let DATABASE;

if (DATABASE_URL === './bot.db') {
    DATABASE = new Sequelize({
        dialect: "sqlite",
        storage: DATABASE_URL,
        logging: false,
    });
} else if (DATABASE_URL === "mysql") {
    DATABASE = new Sequelize(
        process.env.DATABASE_NAME,
        process.env.DATABASE_USERNAME,
        process.env.DATABASE_PASSWORD,
        {
            host: process.env.DATABASE_HOST || '127.0.0.1',
            dialect: DATABASE_URL,
            logging: process.env.STATE === undefined ? FALSE : console.log,
            define: {
                freezeTableName: true,
            },
        }, 

    );
} else {
    new Sequelize(DATABASE_URL, {
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false,
    });
}



module.exports = {
    DATABASE_URL,
    DATABASE,
    apiId: Number(process.env.API_ID),
    apiHash: process.env.API_HASH,
    session: process.env.SESSION ? process.env.SESSION : "",
    BOT_TOKEN: process.env.BOT_TOKEN,
    sudo: this.sudo,
    DEVELOPMENT: process.env.STATE === undefined ? false : process.env.STATE,
    setSudo: function (s) {
        this.sudo = s;
    },
    getSudo: function () {
        return this.sudo;
    }
}