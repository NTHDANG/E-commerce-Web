"use strict";
import { Model } from "sequelize";
export default (sequelize, DataTypes) => {
  class Banner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Banner.hasMany(models.BannerDetail, {
        foreignKey: "banner_id",
        as: "banner_details",
      });
    }
  }
  Banner.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.TEXT,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Banner",
      tableName: "banners",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Banner;
};