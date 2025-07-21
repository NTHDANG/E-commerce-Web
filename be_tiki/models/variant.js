"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Variant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Variant.hasMany(models.VariantValue, {
        foreignKey: "variant_id",
        as: "variant_values",
      });
    }
  }
  Variant.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Variant",
      tableName: "variants",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Variant;
};
