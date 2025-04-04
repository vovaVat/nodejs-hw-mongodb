import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('personal', 'work', 'home').required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email(),
  phoneNumber: Joi.string(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('personal', 'work', 'home'),
}).or('name', 'email', 'phoneNumber', 'isFavourite', 'contactType');
