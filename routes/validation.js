// Validation codes for registration

const Joi = require("@hapi/joi");

const registrationValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(6).required(),
    email: Joi.string().min(6).email(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().min(10).required(),
    role: Joi.string().valid("buyer", "seller").insensitive(),
    location: Joi.string().required(),
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).email(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

module.exports.registrationValidation = registrationValidation;
module.exports.loginValidation = loginValidation;
