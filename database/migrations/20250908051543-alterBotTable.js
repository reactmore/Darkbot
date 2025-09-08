'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // change column sessions on bot table to text long for mysql
    await queryInterface.changeColumn('bot', 'session', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // rollback ke STRING (VARCHAR 255)
    await queryInterface.changeColumn('bot', 'session', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
