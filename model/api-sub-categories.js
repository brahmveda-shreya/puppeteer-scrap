import { DataTypes } from "sequelize";
import sequelize from "../src/common/config/database";

let ApiSubCategories = sequelize.define(
  "api_sub_categories",
  {
    apiCategoryId: { type: DataTypes.INTEGER },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true }
);

export default ApiSubCategories;
