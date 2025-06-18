const mongoose = require("../config/db");
const Joi = require("joi");

const studentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  phone_number: { type: String, required: true },
  role: {
    type: String,
    enum: ["user"],
    default: "user",
  },
  class: { type: String, required: true },
  schoolCode: { type: String, required: true }, // still required, but injected
  regno: { type: String, unique: true, required: true }, // e.g., 2025/SC001/001
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const studentModel = mongoose.model("student_account", studentSchema);

// 2. Joi Validation Schema
const studentValidationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(6)
    .pattern(
      /^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one symbol, letters, and numbers",
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters long",
    }),
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
  phone_number: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid international number.",
      "string.empty": "Phone number is required.",
    }),
  role: Joi.string().valid("user").default("user"),
  class: Joi.string()
    .pattern(/^[A-Za-z0-9\s-]+$/) // Allows letters, numbers, spaces, hyphens
    .min(1)
    .max(20)
    .required()
    .messages({
      "string.base": `"class" should be a type of 'text'`,
      "string.empty": `"class" cannot be an empty field`,
      "string.pattern.base": `"class" may only contain letters, numbers, spaces, or hyphens`,
      "any.required": `"class" is a required field`,
    }),
});

const tokenSchema = new mongoose.Schema({
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "student_account",
  },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" }, // expires after 7 days
});

const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., "2025/CES"
  seq: { type: Number, default: 0 },
});

const studentUpdateValidationSchema = Joi.object({
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

  phone_number: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .messages({
      "string.pattern.base":
        "Phone number must be a valid international number.",
    }),
  class: Joi.string()
    .pattern(/^[A-Za-z0-9\s-]+$/) // Allows letters, numbers, spaces, hyphens
    .min(1)
    .max(20)
    .required()
    .messages({
      "string.base": `"class" should be a type of 'text'`,
      "string.empty": `"class" cannot be an empty field`,
      "string.pattern.base": `"class" may only contain letters, numbers, spaces, or hyphens`,
      "any.required": `"class" is a required field`,
    }),
});

const loginValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(6)
    .pattern(
      /^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one symbol, letters, and numbers",
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters long",
    }),
});

const resendTokenValidationSchema = Joi.object({
  email: Joi.string().email().required(),
});

const countModel = mongoose.model("counter", counterSchema);

const tokenModel = mongoose.model("token", tokenSchema);
const verifytokenSchema = new mongoose.Schema({
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "student_account",
  },
  hash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" }, // expires after 7 days
});

const verifyTokenModel = mongoose.model("verifytoken", verifytokenSchema);

const tokenValidationSchema = Joi.object({
  token: Joi.string()
    .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    .required()
    .messages({
      "string.pattern.base": "Token must be a valid JWT",
      "string.empty": "Token is required",
    }),
});

const changePasswordValidationSchema = Joi.object({
  token: Joi.string()
    .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    .required()
    .messages({
      "string.pattern.base": "Token must be a valid JWT",
      "string.empty": "Token is required",
    }),

  newPass: Joi.string()
    .min(6)
    .pattern(
      /^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one symbol, letters, and numbers",
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters long",
    }),

  confirmPass: Joi.string().valid(Joi.ref("newPass")).required().messages({
    "any.only": "Confirm password must match new password",
    "string.empty": "Confirm password is required",
  }),
});

module.exports = {
  studentModel,
  studentValidationSchema,
  tokenModel,
  countModel,
  studentUpdateValidationSchema,
  loginValidationSchema,
  tokenValidationSchema,
  resendTokenValidationSchema,
  verifyTokenModel,
  changePasswordValidationSchema,
};
