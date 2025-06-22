const sanitize = require("mongo-sanitize");
const {
  ExamSessionModel,
  finishExamValidationSchema,
  fetchExamModel,
} = require("../../model/ExamSessionSchema.model");

const finishExam = async (req, res) => {
  try {
    const sanitizedData = {
      sessionId: sanitize(req.body.sessionId),
    };

    const { error, value } = finishExamValidationSchema.validate(sanitizedData);

    if (error)
      return res.status(403).json({ message: error.details[0].message });

    const session = await ExamSessionModel.findById(value.sessionId);

    const totalScore = session.answers.reduce(
      (sum, ans) => sum + (ans.marksAwarded || 0),
      0
    );

    const max = session.answers.reduce(
      (sum, ans) => sum + (ans.expectedMark || 0),
      0
    );

    const subj = session.subject;
    const year = session.year;
    const examClass = session.class;

    const getExamId = await fetchExamModel.findOne({
      year,
      class: examClass,
      subject: subj,
    });

    session.submittedAt = new Date();
    session.totalScore = totalScore;
    session.maxScore = max;
    session.examId = getExamId._id;

    await session.save();
    res.json({ success: true, score: totalScore, MaxScore: max });
  } catch (error) {
    res.status(500).json({ message: "could not finish exam" });
  }
};

module.exports = finishExam;
