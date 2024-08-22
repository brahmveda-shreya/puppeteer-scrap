import express from "express";
import { serve, setup } from "swagger-ui-express";
import YAML from "yamljs";

const router = express.Router();
const swaggerDocument = YAML.load("src/swagger.yaml");

if (process.env.ENV !== "production") {
  router.use(
    "/",
    (req, res, next) => {
      swaggerDocument.info.title = process.env.APP_NAME;
      swaggerDocument.servers = [
        {
          url:
            process.env.IS_RENDER == "false"
              ? `${process.env.BASE_URL}:${process.env.PORT}/api/v1`
              : `${process.env.BASE_URL}/api/v1`,
          description: "API base url",
        },
      ];
      req.swaggerDoc = swaggerDocument;
      next();
    },
    serve,
    setup(swaggerDocument, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
}

export default router;
