const mongoose = require("../config/db");
const Joi = require("joi");

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin"],
    default: "admin",
  },
  createdAt: { type: Date, default: Date.now },
});

const adminModel = mongoose.model("admin", adminSchema);

// 2. Joi Validation Schema
const adminValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullname: Joi.string()
    .pattern(/^[a-zA-Z ]+$/)
    .required()
    .min(3)
    .max(50)
    .messages({
      "string.pattern.base": "Full name must only contain letters and spaces.",
      "string.empty": "Full name is required.",
      "string.min": "Full name must be at least 3 characters long.",
      "string.max": "Full name must be less than or equal to 50 characters.",
    }),

  role: Joi.string().valid("admin").default("admin"),
});

const adminUpdateValidationSchema = Joi.object({
  fullname: Joi.string()
    .pattern(/^[a-zA-Z ]+$/)
    .min(3)
    .max(50)
    .messages({
      "string.pattern.base": "Full name must only contain letters and spaces.",
      "string.empty": "Full name is required.",
      "string.min": "Full name must be at least 3 characters long.",
      "string.max": "Full name must be less than or equal to 50 characters.",
    }),
});

const loginValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  adminModel,
  adminValidationSchema,
  adminUpdateValidationSchema,
  loginValidationSchema,
};
