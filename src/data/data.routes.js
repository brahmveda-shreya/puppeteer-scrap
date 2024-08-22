import express from "express";
import expressAsyncHandler from "express-async-handler";
import DataController from "./data.controller";
const router = express.Router();

router.get("/api-categories", expressAsyncHandler(DataController.apiCategories));
export default router;
