"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Category.hasMany(models.Product, {
        foreignKey: "category_id",
        as: "products",
      });
    }
  }
  Category.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Category name cannot be empty",
          },
        },
      },
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Category;
};