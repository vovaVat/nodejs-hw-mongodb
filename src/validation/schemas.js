import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required(),
  isFavourite: Joi.boolean(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email(),
  phone: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required(),
  isFavourite: Joi.boolean(),
}).or('name', 'email', 'phone', 'isFavourite');
