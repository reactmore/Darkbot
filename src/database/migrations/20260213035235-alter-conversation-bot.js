'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('conversation_bot', 'active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('conversation_bot', 'completedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

  },

  async down(queryInterface) {

    await queryInterface.removeColumn('conversation_bot', 'active');
    await queryInterface.removeColumn('conversation_bot', 'completedAt');

  }
};
