const Joi = require("joi");

const userinputValidationSchema = Joi.object({
  regno: Joi.string()
    .pattern(/^\d{4}\/[A-Z]{3}\/\d+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Registration number must be in the format YYYY/ABC/NUMBER (e.g. 2025/CES/001)",
      "any.required": "Registration number is required",
    }),
  subject: Joi.string().required(),
});

module.exports = {
  userinputValidationSchema,
};
