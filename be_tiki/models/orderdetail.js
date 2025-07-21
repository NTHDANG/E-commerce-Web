"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OrderDetail.belongsTo(models.ProductVariantValue, {
        foreignKey: "product_variant_id",
        as: "product_variant_value",
      });
      OrderDetail.belongsTo(models.Order, {
        foreignKey: "order_id",
        as: "order",
      });
    }
  }
  OrderDetail.init(
    {
      order_id: DataTypes.INTEGER,
      product_variant_id: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "OrderDetail",
      tableName: "order_details",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return OrderDetail;
};