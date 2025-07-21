'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true, // Cho phép NULL vì các bản ghi cũ không có địa chỉ
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'address');
  }
};