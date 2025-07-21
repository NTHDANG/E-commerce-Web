"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class ProductVariantValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductVariantValue.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
      ProductVariantValue.hasMany(models.OrderDetail, {
        foreignKey: "product_variant_id",
        as: "order_details",
      });
      ProductVariantValue.hasMany(models.CartItem, {
        foreignKey: "product_variant_id",
        as: "cart_items",
      });
    }
  }
  ProductVariantValue.init(
    {
      product_id: DataTypes.INTEGER,
      price: DataTypes.DECIMAL,
      old_price: DataTypes.DECIMAL,
      stock: DataTypes.INTEGER,
      sku: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ProductVariantValue",
      tableName: "product_variant_values",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return ProductVariantValue;
};