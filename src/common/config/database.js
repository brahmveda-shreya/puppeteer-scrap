import { Sequelize } from "sequelize";
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
    query: { raw: true },
    port: 5432,
  }
);

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   logging: false,
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
// });

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connected succefully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
testConnection();

export default sequelize;
