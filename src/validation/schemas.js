import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string()
    .pattern(/^\d{10,15}$/)
    .required(),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('personal', 'business', 'other').required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email(),
  phoneNumber: Joi.string().pattern(/^\d{10,15}$/),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('personal', 'business', 'other'),
}).or('name', 'email', 'phoneNumber', 'isFavourite', 'contactType');
