const sanitize = require("mongo-sanitize");
const {
  ExamSessionModel,
  fetchExamModel,
} = require("../../model/ExamSessionSchema.model");

const checkResultPrinting = async (req, res) => {
  const { regno, class: studentClass, year: currentYear } = req.query;

  if (!regno || !studentClass || !currentYear) {
    return res
      .status(400)
      .json({ message: "Missing required query parameters." });
  }

  try {
    const yearInt = parseInt(currentYear);

    const assignedExams = await fetchExamModel.find({
      class: studentClass,
      year: yearInt,
    });

    const examsTaken = await ExamSessionModel.find({
      regno,
      class: studentClass,
      year: yearInt,
    });

    const examSubjects = assignedExams.map((e) => e.subject);
    const allSubjectsTaken = examsTaken.map((s) => s.subject);

    const pendingSubjects = examSubjects.filter(
      (subject) => !allSubjectsTaken.includes(subject)
    );

    const allDone = pendingSubjects.length === 0;

    res.json({
      message: "Fetched student result printing status",
      data: {
        allDone,
        pendingSubjects,
      },
    });
  } catch (error) {
    console.error("Error in checkResultPrinting:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = checkResultPrinting;
