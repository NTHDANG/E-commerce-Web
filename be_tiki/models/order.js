"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.hasMany(models.OrderDetail, {
        foreignKey: "order_id",
        as: "order_details",
      });
      Order.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  Order.init(
    {
      session_id: DataTypes.TEXT,
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow null for guest orders
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 1, // Default status, e.g., 1 for 'Pending'
      },
      note: DataTypes.TEXT,
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^[0-9]{10,11}$/,
            msg: "Phone number is not valid",
          },
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Address cannot be empty",
          },
        },
      },
      total: {
        type: DataTypes.DECIMAL(10, 2), // 10 total digits, 2 after decimal
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Total must be a non-negative value",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Order;
};