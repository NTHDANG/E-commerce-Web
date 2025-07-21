"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("product_variant_values", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "products",
          key: "id",
        },
      },
      price: {
        type: Sequelize.DECIMAL,
      },
      old_price: {
        type: Sequelize.DECIMAL,
      },
      stock: {
        type: Sequelize.INTEGER,
      },
      sku: {
        type: Sequelize.STRING,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("product_variant_values");
  },
};
