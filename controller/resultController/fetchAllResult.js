const sanitize = require("mongo-sanitize");
const {
  regnoSchema,
  fetchResultValidationSchema,
} = require("../../model/result_model");
const { ExamSessionModel } = require("../../model/ExamSessionSchema.model");
const { studentModel } = require("../../model/student_account.model");

const fetchAllResults = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Missing user data" });
    }

    const sanitizedData = {
      userId: sanitize(req.user.id),
    };

    const { error, value } =
      fetchResultValidationSchema.validate(sanitizedData);

    if (error)
      return res.status(405).json({ message: error.details[0].message });

    const fullUser = await studentModel.findById(value.userId);

    const allResults = await ExamSessionModel.find({
      regno: fullUser.regno,
    }).populate("examId");

    if (!allResults || allResults.length === 0)
      return res.status(403).json({
        message:
          "There are no results available for this student at the moment",
      });

    const formattedResult = allResults.map((result) => ({
      id: result._id,
      title: result.examId?.title || "Unknown",
      start: new Date(result.startedAt).toLocaleString(),
      submitted: new Date(result.submittedAt).toLocaleString(),
      totalscore: result.totalScore,
      maxscore: result.maxScore,
      status: result.totalScore >= 0.5 * result.maxScore ? "Pass" : "Fail",
    }));

    res.status(200).json({
      message: "Fetched result successfully",
      data: formattedResult,
    });
  } catch (error) {
    res.status(500).json({
      message: "could not fetch result at the moment, try again later.",
    });
  }
};

module.exports = fetchAllResults;
