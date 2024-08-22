import { DataTypes } from "sequelize";
import sequelize from "../src/common/config/database";

let ApiCategories = sequelize.define(
  "api_categories",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true }
);

export default ApiCategories;
