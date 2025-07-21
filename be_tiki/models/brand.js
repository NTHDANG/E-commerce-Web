"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Brand extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Brand.hasMany(models.Product, {
        foreignKey: "brand_id",
        as: "products",
      });
    }
  }
  Brand.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Brand name cannot be empty",
          },
        },
      },
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Brand",
      tableName: "brands",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Brand;
};
