const mongoose = require("mongoose");
const Joi = require("joi");

const twoFactorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "student_account",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Optional: TTL index to auto-delete expired docs (Mongo will delete after `expiresAt`)
twoFactorSchema.index({ expiresAt: 1 }, { expiresAfterSeconds: 0 });

const twoFactorModel = mongoose.model("twoFactor", twoFactorSchema);

const validateTwoFactorInput = Joi.object({
  userId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId validation")
    .required(),
  codeEntered: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Code Entered must be a 6-digit number.",
    }),
});

const validateResendOTP = Joi.object({
  userId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId validation")
    .required(),
});

module.exports = { twoFactorModel, validateTwoFactorInput, validateResendOTP };
