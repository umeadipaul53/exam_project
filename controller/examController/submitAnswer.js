const sanitize = require("mongo-sanitize");
const {
  ExamSessionModel,
  submitAnswerSchema,
} = require("../../model/ExamSessionSchema.model");
const { questionModel } = require("../../model/set_exam_question.model");

const submitAnswer = async (req, res) => {
  try {
    const sanitizedData = {
      sessionId: sanitize(req.body.sessionId),
      questionId: sanitize(req.body.questionId),
      selectedOption: sanitize(req.body.selectedOption),
    };

    const { error, value } = submitAnswerSchema.validate(sanitizedData);

    if (error)
      return res.status(403).json({ message: error.details[0].message });

    const question = await questionModel.findById(value.questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    if (!question.options.includes(value.selectedOption))
      return res.status(400).json({
        message: "Selected answer is not a valid option for this question",
      });

    const isCorrect = question.correctAnswer === value.selectedOption;
    const AwardedMark = isCorrect ? question.marks || 1 : 0;
    const MarkExpected = question.marks;

    const session = await ExamSessionModel.findById(value.sessionId);
    if (!session)
      return res.status(404).json({ message: "Exam session not found" });

    const qd = value.questionId;

    const existingIndex = session.answers.findIndex(
      (ans) => ans.questionId === qd
    );

    if (existingIndex !== -1) {
      // Update existing answer
      session.answers[existingIndex] = {
        questionId: qd,
        selectedAnswer: value.selectedOption,
        isCorrect: isCorrect,
        marksAwarded: AwardedMark,
        expectedMark: MarkExpected,
      };
    } else {
      // Add new answer
      session.answers.push({
        questionId: qd,
        selectedAnswer: value.selectedOption,
        isCorrect: isCorrect,
        marksAwarded: AwardedMark,
        expectedMark: MarkExpected,
      });
    }

    await session.save();
    res.json({ success: true, message: "question answered" });
  } catch (error) {
    res.status(500).json({ message: "could not submit answer" });
  }
};

module.exports = submitAnswer;
