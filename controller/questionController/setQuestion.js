const sanitize = require("mongo-sanitize");
const {
  questionModel,
  questionValidationSchema,
} = require("../../model/set_exam_question.model");
const { fetchExamModel } = require("../../model/ExamSessionSchema.model");

const setQuestions = async (req, res) => {
  try {
    const questions = Array.isArray(req.body) ? req.body : [];

    if (!questions.length)
      return res.status(400).json({ message: "No questions provided" });

    const sanitizedQuestions = [];
    const validationErrors = [];
    const currentYear = new Date().getFullYear();
    let examCreated = false;
    let firstValidExamData = null;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const sanitizedData = {
        question: sanitize(q.question),
        options: Array.isArray(q.options)
          ? q.options.map((opt) => sanitize(opt))
          : [],
        correctAnswer: sanitize(q.correctAnswer),
        marks: Number(q.marks),
        class: sanitize(q.class),
        subject: sanitize(q.subject),
        duration: sanitize(q.duration),
      };

      // Validate inside the loop
      const { error, value } = questionValidationSchema.validate(sanitizedData);
      if (error) {
        validationErrors.push({
          index: i + 1,
          message: error.details[0].message,
          question: q,
        });
        continue; // Skip this invalid question
      }

      if (!firstValidExamData) {
        firstValidExamData = {
          class: value.class,
          subject: value.subject,
          duration: value.duration,
        };
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          message: "Some questions failed validation",
          errors: validationErrors,
          validCount: sanitizedData.length,
          invalidCount: validationErrors.length,
        });
      }

      if (!examCreated && firstValidExamData) {
        // Create exam only once
        const existingExam = await fetchExamModel.findOne({
          class: value.class,
          subject: value.subject,
          year: currentYear,
        });

        if (!existingExam) {
          await fetchExamModel.create({
            class: value.class,
            subject: value.subject,
            duration: value.duration,
            year: currentYear,
          });
        }

        examCreated = true;
      }

      // Add to list of validated & sanitized questions
      sanitizedQuestions.push({
        question: value.question,
        options: value.options,
        correctAnswer: value.correctAnswer,
        marks: value.marks,
        class: value.class,
        subject: value.subject,
      });
    }

    // Save all at once
    const saved = await questionModel.insertMany(sanitizedQuestions);

    res.status(201).json({
      message: "Questions uploaded successfully",
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to upload questions",
      error: error.message || error,
    });
  }
};

module.exports = setQuestions;
