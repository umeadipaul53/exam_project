const {
  questionModel,
  deleteQuestionValidationSchema,
} = require("../../model/set_exam_question.model");

const DeleteAllQuestions = async (req, res) => {
  try {
    const hasQuestions = await questionModel.exists({});

    if (!hasQuestions)
      return res.status(400).json({ message: "no question found" });

    const question = await questionModel.deleteMany({});

    if (!question)
      return res.status().json({ message: "could not delete questions" });

    res.status(200).json({ message: "Deleted all questions successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Cannot delete questions now" });
  }
};

module.exports = DeleteAllQuestions;
