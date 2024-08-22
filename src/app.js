require("dotenv").config();

import express from "express";
import http from "http";
import routes from "../routes";
import db from "../model/index";
import cors from "cors";
import handleError from "./common/middleware/error-handler";
import swagger from "./common/config/swagger";
import seeder from "../seeder";
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.Server(app);

app.use("/api/documentation", swagger);
app.use("/", routes);
app.use(handleError);

// if (isSecure) {
//   var options = {
//     key: fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/privkey.pem`),
//     cert: fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/cert.pem`),
//     ca: [
//       fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/cert.pem`),
//       fs.readFileSync(`${process.env.SSL_CERT_BASE_PATH}/fullchain.pem`),
//     ],
//   };
//   var https = require("https").Server(options, app);
//   io.attach(https);

//   https.listen(process.env.PORT, () => {
//     console.log(
//       `Https server is running on ${process.env.BASE_URL}:${process.env.PORT}`
//     );
//   });
// } else {

// sync({ alter: true })

db.sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database sync succefully");
    server.listen(process.env.PORT || 9001, () => {
      seeder();
      console.log(`listening at ${process.env.BASE_URL}:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database");
  });
