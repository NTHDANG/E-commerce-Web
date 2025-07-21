"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Brand, { foreignKey: "brand_id", as: "brand" });
      Product.belongsTo(models.Category, { foreignKey: "category_id", as: "category" });
      Product.hasMany(models.BannerDetail, { foreignKey: "product_id", as: "banner_details" });
      Product.hasMany(models.Feedback, { foreignKey: "product_id", as: "feedbacks" });
      Product.hasMany(models.NewsDetail, { foreignKey: "product_id", as: "news_details" });
      Product.hasMany(models.ProductImage, { foreignKey: "product_id", as: "product_images" });
      Product.hasMany(models.ProductAttributeValue, {
        foreignKey: "product_id",
        as: "product_attribute_values",
      });
      Product.hasMany(models.ProductVariantValue, { foreignKey: "product_id", as: "product_variant_values" });
    }
  }
  Product.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Product name cannot be empty",
          },
        },
      },
      description: DataTypes.TEXT,
      brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      total_ratings: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      total_sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Product;
};