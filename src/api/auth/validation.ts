import { Joi } from 'express-validation';

export default {
  login: {
    body: Joi.object({
      studentCode: Joi.string().required(),
      password: Joi.string().required(),
    }),
  },
  signup: {
    body: Joi.object({
      studentCode: Joi.string().required(),
      password: Joi.string().required(),
      phone: Joi.string().required(),
    }),
  },
};
