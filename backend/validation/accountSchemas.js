const Joi = require('joi');

const profileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().allow('', null).max(20).optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).max(128).required(),
  newPassword: Joi.string().min(6).max(128).required()
});

const deleteAccountSchema = Joi.object({
  currentPassword: Joi.string().min(6).max(128).required()
});

module.exports = {
  profileSchema,
  changePasswordSchema,
  deleteAccountSchema
};
