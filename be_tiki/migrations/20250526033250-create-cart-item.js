"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cart_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cart_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "carts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE", // CASCADE: khi cart bị xóa thì cart items củng bị xóa theo
      },
      product_variant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "product_variant_values",
          key: "id",
        },
      },
      quantity: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("cart_items");
  },
};
