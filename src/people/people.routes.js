import express from "express";
import PeopleController from "./people.controller";
import expressAsyncHandler from "express-async-handler";
import { createPeopleDto, sendMessageDto } from "./dtos/people.dto";
import validator from "../common/config/joi-validation";
const router = express.Router();

router.get("/", expressAsyncHandler(PeopleController.index));
router.post(
  "/",
  validator.body(createPeopleDto),
  expressAsyncHandler(PeopleController.create)
);

router.post(
  "/partner",
  validator.body(createPeopleDto),
  expressAsyncHandler(PeopleController.partner)
);

router.post(
  "/send-message",
  validator.body(sendMessageDto),
  expressAsyncHandler(PeopleController.sendMessage)
);
export default router;
