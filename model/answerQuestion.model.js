const mongoose = require("mongoose");
const Joi = require("joi");

const answerQuestionSchema = new mongoose.Schema({
  regno: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  answers: [
    {
      questionId: String,
      selectedAnswer: String,
      isCorrect: Boolean,
      marksAwarded: Number,
    },
  ],
  totalScore: { type: Number },
  maxScore: { type: Number },
  submittedAt: { type: Date, default: Date.now },
});

const answerQuestionModel = mongoose.model("result", answerQuestionSchema);

const answerQuestionValidationSchema = Joi.object({
  regno: Joi.string()
    .pattern(/^\d{4}\/[A-Z]{3}\/\d+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Registration number must be in the format YYYY/ABC/NUMBER (e.g. 2025/CES/001)",
      "any.required": "Registration number is required",
    }),
  subject: Joi.string().required(),

  class: Joi.string().required(),

  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedAnswer: Joi.string().required(),
        isCorrect: Joi.boolean().required(),
        marksAwarded: Joi.number().required(),
      })
    )
    .min(1)
    .required(),
});

module.exports = { answerQuestionModel, answerQuestionValidationSchema };
