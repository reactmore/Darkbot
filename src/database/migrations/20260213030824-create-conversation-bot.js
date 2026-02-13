'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('conversation_bot', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      userId: {
        type: Sequelize.STRING,
        allowNull: false
      },

      botToken: {
        type: Sequelize.STRING,
        allowNull: false
      },

      step: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      flow: {
        type: Sequelize.STRING,
        allowNull: false
      },

      data: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }

    });

    // 🔥 IMPORTANT: Composite Index biar cepat
    await queryInterface.addIndex('conversation_bot', ['userId', 'botToken'], {
      name: 'conversation_bot_user_token_index'
    });

  },

  async down(queryInterface) {
    await queryInterface.dropTable('conversation_bot');
  }
};

