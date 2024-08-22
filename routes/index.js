import express from "express";
const router = express.Router();
import apiRoutes from "./api";

router.get("/", (req, res) => {
  res.send("Welcome to Astrology API");
});
router.use("/api/v1", apiRoutes);
export default router;
