import { DataTypes } from "sequelize";
import sequelize from "../src/common/config/database";

let PeopleDetails = sequelize.define(
  "people_details",
  {
    peopleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    hindiDetails: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    dailyDate: {
      type: DataTypes.DATEONLY,
      defaultValue: null,
      allowNull: true, // this date is for daily sun, daily moon
    },
    week: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true, // this date is for weekly sun, weekly moon
    },
    weekStart: {
      type: DataTypes.DATEONLY,
      defaultValue: null,
      allowNull: true, // this date is for weekly moon and sun
    },
    weekEnd: {
      type: DataTypes.DATEONLY,
      defaultValue: null,
      allowNull: true, // this date is for weekly moon and sun
    },
    year: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true, // this date is for yearly prediction
    },
  },
  { timestamps: true }
);

export default PeopleDetails;
