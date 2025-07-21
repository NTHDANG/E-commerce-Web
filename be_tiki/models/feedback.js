"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Feedback.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
      Feedback.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  Feedback.init(
    {
      product_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      star: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Feedback",
      tableName: "feedbacks",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Feedback;
};