const sanitize = require("mongo-sanitize");
const {
  questionModel,
  deleteQuestionValidationSchema,
} = require("../../model/set_exam_question.model");
const { Types } = require("mongoose");

const DeleteOneQuestion = async (req, res) => {
  try {
    const sanitizedData = {
      questionId: sanitize(req.body.id),
    };

    const { error, value } =
      deleteQuestionValidationSchema.validate(sanitizedData);

    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const question = await questionModel.deleteOne({
      _id: Types.ObjectId(value.questionId),
    });

    if (!question)
      return res.status().json({ message: "could not delete this question" });

    res.status(200).json({ message: "Deleted this question successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Cannot delete question now, try again later" });
  }
};

module.exports = DeleteOneQuestion;
