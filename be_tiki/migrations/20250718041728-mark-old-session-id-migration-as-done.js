'use strict';

const oldMigrations = [
  '20250515022345-create-category.js',
  '20250515022346-create-brand.js',
  '20250515022347-create-news.js',
  '20250515022348-create-banner.js',
  '20250515065724-create-order.js',
  '20250515072443-create-product.js',
  '20250516030111-create-order-detail.js',
  '20250516032638-create-banner-detail.js',
  '20250516033909-create-feedback.js',
  '20250516035047-create-news-detail.js',
  '20250520092544-create-user.js',
  '20250525072839-create-product-image.js',
  '20250526025211-add_session_to_orders.js',
  '20250526032915-create-cart.js',
  '20250526033250-create-cart-item.js',
  '20250528141357-create-attribute.js',
  '20250528141358-create-product-attribute-value.js',
  '20250605071553-create-product-variant-value.js',
  '20250605071555-create-variant.js',
  '20250605071556-create-variant-value.js',
  '20250605081558-create-products-new.js',
  '20250605083910-update-foreign-keys-to-products-new.js',
  '20250605083957-rename-products-to-old-and-drop.js',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const records = oldMigrations.map(name => ({ name }));
    await queryInterface.bulkInsert('SequelizeMeta', records, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SequelizeMeta', {
      name: {
        [Sequelize.Op.in]: oldMigrations
      }
    }, {});
  }
};