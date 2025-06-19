const sanitize = require("mongo-sanitize");
const {
  questionModel,
  questionValidationSchema,
} = require("../../model/set_exam_question.model");
const { fetchExamModel } = require("../../model/ExamSessionSchema.model");

const setQuestions = async (req, res) => {
  try {
    // Sanitize incoming data
    const sanitizedData = {
      question: sanitize(req.body.question),
      options: Array.isArray(req.body.options)
        ? req.body.options.map((opt) => sanitize(opt))
        : [],
      correctAnswer: sanitize(req.body.correctAnswer),
      marks: Number(req.body.marks),
      class: sanitize(req.body.class),
      subject: sanitize(req.body.subject),
      duration: sanitize(req.body.duration),
    };

    // Validate sanitized input
    const { error, value } = questionValidationSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const currentYear = new Date().getFullYear();
    const createExam = await fetchExamModel.findOne({
      class: value.class,
      subject: value.subject,
      year: currentYear,
    });

    if (!createExam) {
      await fetchExamModel.create({
        class: value.class,
        subject: value.subject,
        duration: value.duration,
      });
      console.log("Created new exam:");
    }

    // Save the question to the database
    const saved = await questionModel.create({
      question: value.question,
      options: value.options,
      correctAnswer: value.correctAnswer,
      marks: value.marks,
      class: value.class,
      subject: value.subject,
    });

    res.status(201).json({
      message: "Question created",
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to upload question",
      error: error.message || error,
    });
  }
};

module.exports = setQuestions;
