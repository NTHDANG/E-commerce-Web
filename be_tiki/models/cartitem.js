"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CartItem.belongsTo(models.Cart, {
        foreignKey: "cart_id",
        as: "cart",
      });
      CartItem.belongsTo(models.ProductVariantValue, {
        foreignKey: "product_variant_id",
        as: "product_variant_value",
      });
    }
  }
  CartItem.init(
    {
      cart_id: DataTypes.INTEGER,
      product_variant_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "cart_items",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return CartItem;
};