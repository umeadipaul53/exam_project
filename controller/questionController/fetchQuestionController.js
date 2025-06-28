const sanitize = require("mongo-sanitize");
const { questionModel } = require("../../model/set_exam_question.model");
const { studentModel } = require("../../model/student_account.model");
const {
  userinputValidationSchema,
} = require("../../model/fetch_question_model");

const fetchQuestions = async (req, res) => {
  try {
    const sanitizedData = {
      regno: sanitize(req.query.regno),
      subject: sanitize(req.query.subject),
    };

    // validate student search input
    const { error, value } = userinputValidationSchema.validate(sanitizedData);

    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // check if student exist with the regno
    const student = await studentModel.findOne({ regno: value.regno });

    if (!student)
      return res.status(500).json({ message: "this student does not exist" });

    const studentClass = student.class;
    const currentYear = new Date().getFullYear();

    const pageValue = value.page;
    const limit = 1; // One question per page
    const skip = (pageValue - 1) * limit;
    const filter = {
      subject: value.subject,
      class: studentClass,
      year: currentYear,
    };

    const questions = await questionModel
      .find(filter)
      .select("-correctAnswer")
      .sort({ createdAt: 1 }); // ascending order or use -1 for descending order
    // .skip(skip)
    // .limit(limit);

    if (!questions)
      return res.status(400).json({
        message:
          "there are no available questions for this subject at the moment",
      });

    const totalQuestions = await questionModel.countDocuments(filter);

    res.status(200).json({
      message: "Below are the questions you are to answer",
      data: {
        totalQuestions,
        questions: questions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "failed to fetch questions", data: error });
  }
};

module.exports = fetchQuestions;
