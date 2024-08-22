import { DataTypes } from "sequelize";
import sequelize from "../src/common/config/database";
import moment from "moment";

let People = sequelize.define(
  "people",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // gender: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    // birthDate: {
    //   type: DataTypes.DATE,
    //   allowNull: false,
    // },
    // birthTime: {
    //   type: DataTypes.TIME,
    //   allowNull: false,
    // },
    birthDate: {
      type: DataTypes.DATEONLY, // Use DATEONLY for date without time
      allowNull: false,
      validate: {
        isDate: true, // Ensures it's a valid date
      },
      set(value) {
        this.setDataValue("birthDate", moment(value).format("YYYY-MM-DD")); // Store in ISO 8601 format
      },
    },
    birthTime: {
      type: DataTypes.TIME, // Use TIME for time without date
      allowNull: false,
      validate: {
        is: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, // Validates HH:mm or HH:mm:ss format
      },
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kundali: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    partnerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  { timestamps: true }
);

export default People;
