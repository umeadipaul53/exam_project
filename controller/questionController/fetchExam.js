const sanitize = require("mongo-sanitize");
const {
  fetchExamModel,
  fetchExamValidationSchema,
} = require("../../model/ExamSessionSchema.model");

const fetchExam = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    // Assume req.user.class comes from authentication middleware
    const sanitizedData = {
      class: sanitize(req.user.class),
    };

    const { error, value } = fetchExamValidationSchema.validate(sanitizedData);
    if (error)
      return res.status(403).json({ message: error.details[0].message });

    const filter = {
      class: value.class,
      year: currentYear,
    };
    const selectedExams = await fetchExamModel.find(filter);

    if (!selectedExams || selectedExams.length === 0)
      return res.status(404).json({
        message: "There are no exams available for this class at the moment",
      });

    // Transform response data
    const formattedExams = selectedExams.map((exam) => ({
      id: exam._id,
      title: exam.title,
      subject: exam.subject,
      duration: exam.duration,
      class: exam.class,
      year: exam.year,
    }));

    res.status(200).json({
      message: "Exams fetched successfully",
      data: formattedExams,
    });
  } catch (error) {
    res.status(403).json({ message: "could not fetch exam" });
  }
};

module.exports = fetchExam;
