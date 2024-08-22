import Joi from "joi";

export const getDetailsDto = Joi.object().keys({
  category: Joi.string().required(),
  subCategory: Joi.string().required(),
  personId: Joi.number().required(),
});

export const dailySunDto = Joi.object().keys({
  personId: Joi.number().required(),
  date: Joi.required(),
  split: Joi.boolean().required(),
  lang: Joi.string().required(),
});

export const weeklySunDto = Joi.object().keys({
  personId: Joi.number().required(),
  week: Joi.required(),
  split: Joi.boolean().required(),
  lang: Joi.string().required(),
});

export const yearlyPredictionDto = Joi.object().keys({
  personId: Joi.number().required(),
  year: Joi.required(),
  lang: Joi.string().required(),
});
