import Joi from "joi";

export const createPeopleDto = Joi.object().keys({
  name: Joi.string().required(),
  gender: Joi.string().required(),
  birthDate: Joi.date().required(),
  birthTime: Joi.string().required(),
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  timezone: Joi.string().required(),
  partnerId: Joi.number().optional(),
});

export const sendMessageDto = Joi.object().keys({
  peopleId: Joi.number().required(),
  message: Joi.string().required(),
});
