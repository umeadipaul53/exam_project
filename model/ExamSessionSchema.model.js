const mongoose = require("mongoose");
const Joi = require("joi");

const ExamSessionSchema = new mongoose.Schema({
  regno: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  answers: [
    {
      questionId: String,
      selectedAnswer: String,
      isCorrect: Boolean,
      marksAwarded: Number,
      expectedMark: Number,
    },
  ],
  year: { type: Number, default: new Date().getFullYear(), immutable: true },
  totalScore: { type: Number },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "examtable", // reference to your exam table
  },
  maxScore: { type: Number },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
});

ExamSessionSchema.index({ regno: 1, subject: 1, class: 1 }, { unique: true });

const ExamSessionModel = mongoose.model("result", ExamSessionSchema);

const fetchExamSchema = new mongoose.Schema({
  year: { type: Number, default: new Date().getFullYear(), immutable: true },
  class: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  duration: { type: Number, required: true, min: 1, max: 180 },
  title: {
    type: String,
    default: function () {
      // Only run if subject is set
      if (this.subject) {
        return this.subject.slice(0, 3).toUpperCase() + " Exam";
      }
      return "Exam"; // fallback
    },
    immutable: true, // Optional: Prevent title from being updated manually
  },
});

const fetchExamModel = mongoose.model("examtable", fetchExamSchema);

const fetchExamValidationSchema = Joi.object({
  class: Joi.string().trim().min(1).required(),
});

const submitAnswerSchema = Joi.object({
  sessionId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "any.required": "sessionId is required",
      "string.pattern.base": "sessionId must be a valid MongoDB ObjectId",
    }),
  questionId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "any.required": "questionId is required",
      "string.pattern.base": "questionId must be a valid MongoDB ObjectId",
    }),
  selectedOption: Joi.string().min(1).max(500).required().messages({
    "string.base": "selectedOption must be a string",
    "string.empty": "selectedOption cannot be empty",
    "string.max": "selectedOption is too long",
    "any.required": "selectedOption is required",
  }),
});

const finishExamValidationSchema = Joi.object({
  sessionId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "any.required": "sessionId is required",
      "string.pattern.base": "sessionId must be a valid MongoDB ObjectId",
    }),
});

const ExamSessionModelValidationSchema = Joi.object({
  regno: Joi.string()
    .pattern(/^\d{4}\/[A-Z]{3}\/\d+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Registration number must be in the format YYYY/ABC/NUMBER (e.g. 2025/CES/001)",
      "any.required": "Registration number is required",
    }),
  subject: Joi.string().min(5).required().messages({
    "string.empty": "Subject is required",
    "string.min": "Subject must be at least 5 characters long",
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

module.exports = {
  ExamSessionModel,
  submitAnswerSchema,
  ExamSessionModelValidationSchema,
  finishExamValidationSchema,
  fetchExamModel,
  fetchExamValidationSchema,
};
