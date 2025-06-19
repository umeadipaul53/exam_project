const mongoose = require("mongoose");
const Joi = require("joi");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String], // input all options
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length >= 2;
      },
      message: "Questions must have at least two options.",
    },
  },
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function (val) {
        return this.options.includes(val);
      },
      message: "Correct answer must be one of the options.",
    },
  },
  marks: { type: Number, default: 1, required: true },
  class: { type: String, required: true },
  subject: { type: String, required: true },
  year: { type: Number, default: new Date().getFullYear(), immutable: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  duration: { type: Number, required: true, min: 1, max: 180 },
});

const questionModel = mongoose.model("question", questionSchema);

const questionValidationSchema = Joi.object({
  question: Joi.string().min(5).required().messages({
    "string.empty": "Question is required",
    "string.min": "Question must be at least 5 characters long",
  }),

  options: Joi.array()
    .items(Joi.string().required())
    .min(2)
    .required()
    .messages({
      "array.base": "Options must be an array of strings",
      "array.min": "There must be at least two options",
    }),

  correctAnswer: Joi.string()
    .required()
    .custom((value, helpers) => {
      const { options } = helpers.state.ancestors[0];
      if (!options || !options.includes(value)) {
        return helpers.message("Correct answer must be one of the options");
      }
      return value;
    }),

  marks: Joi.number().min(1).default(1).required().messages({
    "number.base": "Marks must be a number",
    "number.min": "Marks must be at least 1",
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
  subject: Joi.string().min(5).required().messages({
    "string.empty": "Subject is required",
    "string.min": "Subject must be at least 5 characters long",
  }),
  duration: Joi.number().integer().min(1).required().messages({
    "number.base": "Duration must be a number",
    "number.min": "Duration must be at least 1 minute",
    "any.required": "Duration is required",
  }),
});

module.exports = { questionModel, questionValidationSchema };
