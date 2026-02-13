'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('bot', 'clientId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addConstraint('bot', {
      fields: ['clientId'],
      type: 'foreign key',
      name: 'fk_bot_client',
      references: {
        table: 'client_account',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addColumn('bot', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('bot', 'fk_bot_client');
    await queryInterface.removeColumn('bot', 'clientId');
    await queryInterface.removeColumn('bot', 'isActive');
  }
};
