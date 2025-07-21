"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class ProductImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductImage.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }
  ProductImage.init(
    {
      product_id: DataTypes.INTEGER,
      image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ProductImage",
      tableName: "product_images",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return ProductImage;
};
