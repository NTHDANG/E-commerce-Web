"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Attribute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Attribute.hasMany(models.ProductAttributeValue, {
        foreignKey: "attribute_id",
        as: "product_attribute_values",
      });
    }
  }
  Attribute.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Attribute",
      tableName: "attributes",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Attribute;
};