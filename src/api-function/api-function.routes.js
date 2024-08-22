import express from "express";
import expressAsyncHandler from "express-async-handler";
import ApiFunctionController from "./api-function.controller";
const router = express.Router();
import validator from "../common/config/joi-validation";
import {
  dailySunDto,
  getDetailsDto,
  weeklySunDto,
  yearlyPredictionDto,
} from "./dtos/app-function.dto";

router.get(
  "/",
  validator.query(getDetailsDto),
  expressAsyncHandler(ApiFunctionController.getDetails)
);

router.get(
  "/horoscope/personal-characteristics",
  expressAsyncHandler(ApiFunctionController.personalCharacteristics)
);

router.get(
  "/horoscope/ascendant-report",
  expressAsyncHandler(ApiFunctionController.ascendantReport)
);

router.get(
  "/dashas/maha-dasha-predictions",
  expressAsyncHandler(ApiFunctionController.mahaDashaPredictions)
);

router.get(
  "/dosha/manglik-dosh",
  expressAsyncHandler(ApiFunctionController.maglikDosh)
);

router.get(
  "/dosha/kaalsarp-dosh",
  expressAsyncHandler(ApiFunctionController.kaalsarpDosh)
);

router.get(
  "/prediction/daily-sun",
  validator.query(dailySunDto),
  expressAsyncHandler(ApiFunctionController.dailySun)
);

router.get(
  "/prediction/daily-moon",
  validator.query(dailySunDto),
  expressAsyncHandler(ApiFunctionController.dailyMoon)
);

router.get(
  "/prediction/weekly-sun",
  validator.query(weeklySunDto),
  expressAsyncHandler(ApiFunctionController.weeklySun)
);

router.get(
  "/prediction/weekly-moon",
  validator.query(weeklySunDto),
  expressAsyncHandler(ApiFunctionController.weeklyMoon)
);

router.get(
  "/prediction/yearly",
  validator.query(yearlyPredictionDto),
  expressAsyncHandler(ApiFunctionController.yearlyPrediction)
);

export default router;
