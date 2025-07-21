// user.js

"use strict";
import { Model, Op } from "sequelize";
import argon2 from "argon2";

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true, // Allow null if phone is provided
        validate: {
          isEmail: true,
          async isUnique(value) {
            if (!value) return;
            const user = await User.findOne({
              where: {
                email: value,
                id: { [Op.ne]: this.id }, // Exclude current user
              },
            });
            if (user) {
              throw new Error("Email already in use!");
            }
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [8, 255],
            msg: "Password must be at least 8 characters long",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name cannot be empty",
          },
        },
      },
      role: {
        type: DataTypes.INTEGER,
        defaultValue: 1, // Default role, e.g., 1 for regular user
      },
      avatar: DataTypes.STRING,
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true, // Allow null if email is provided
        validate: {
          is: {
            args: /^[0-9]{10,11}$/,
            msg: "Phone number is not valid",
          },
          async isUnique(value) {
            if (!value) return;
            const user = await User.findOne({
              where: {
                phone: value,
                id: { [Op.ne]: this.id }, // Exclude current user
              },
            });
            if (user) {
              throw new Error("Phone number already in use!");
            }
          },
        },
      },
      is_locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      password_changed_at: DataTypes.DATE,
      address: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
      },
    }
  );
  return User;
};
