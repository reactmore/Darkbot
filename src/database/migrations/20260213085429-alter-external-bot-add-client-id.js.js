'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('external_bot', 'clientId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn('external_bot', 'isRegistered', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addConstraint('external_bot', {
      fields: ['clientId'],
      type: 'foreign key',
      name: 'fk_external_bot_client',
      references: {
        table: 'client_account',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('external_bot', 'fk_external_bot_client');
    await queryInterface.removeColumn('external_bot', 'clientId');
    await queryInterface.removeColumn('external_bot', 'isRegistered');
  }
};
