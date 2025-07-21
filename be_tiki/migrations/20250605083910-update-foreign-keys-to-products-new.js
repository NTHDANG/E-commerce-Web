"use strict";
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Danh sách các bảng cần cập nhật (tùy thuộc vào model của bạn)
    const tables = [
      "order_details",
      "banner_details",
      "feedbacks",
      "news_details",
      "product_images",
      "cart_items",
      "product_attribute_values",
      "product_variant_values",
    ];

    for (const table of tables) {
      await queryInterface.sequelize.query(
        `UPDATE ${table} SET product_id = (SELECT id FROM products_new WHERE id = ${table}.product_id)`
      );
    }
  },
  async down(queryInterface, Sequelize) {
    // Rollback không cần thiết ở đây vì chỉ là cập nhật dữ liệu
  },
};
