const sanitize = require("mongo-sanitize");
const {
  questionModel,
  questionValidationSchema,
} = require("../../model/set_exam_question.model");

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
    };

    // Validate sanitized input
    const { error, value } = questionValidationSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Save the question to the database
    const saved = await questionModel.create(value);

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
