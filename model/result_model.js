const mongoose = require("mongoose");
const Joi = require("joi");

const regnoSchema = Joi.string()
  .pattern(/^\d{4}\/[A-Z]{3}\/\d{3}$/)
  .required()
  .messages({
    "string.pattern.base":
      "Regno must be in the format YYYY/XXX/NNN (e.g., 2025/CES/034)",
    "string.empty": "Regno is required",
  });

const fetchResultValidationSchema = Joi.object({
  userId: Joi.string().length(24).hex().required(),
});

module.exports = { regnoSchema, fetchResultValidationSchema };
