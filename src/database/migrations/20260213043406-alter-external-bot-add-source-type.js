'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('external_bot', 'sourceType', {
      type: Sequelize.ENUM('gist', 'repo'),
      allowNull: false,
      defaultValue: 'gist'
    });

    await queryInterface.addColumn('external_bot', 'branch', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'main'
    });

    await queryInterface.addColumn('external_bot', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('external_bot', 'sourceType');
    await queryInterface.removeColumn('external_bot', 'branch');
    await queryInterface.removeColumn('external_bot', 'isActive');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_external_bot_sourceType";'
    );
  }
};
