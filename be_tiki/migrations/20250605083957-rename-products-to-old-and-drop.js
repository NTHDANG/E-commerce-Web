"use strict";
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Đổi tên bảng products thành products_old
    await queryInterface.renameTable("products", "products_old");
    // Đổi tên bảng products_new thành products
    await queryInterface.renameTable("products_new", "products");
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable("products", "products_new");
    await queryInterface.renameTable("products_old", "products");
  },
};
