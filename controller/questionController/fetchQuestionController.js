const sanitize = require("mongo-sanitize");
const { questionModel } = require("../../model/set_exam_question.model");
const { studentModel } = require("../../model/student_account.model");
const { answerQuestionModel } = require("../../model/answerQuestion.model");
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

    //verify if the student has taken the exam before
    const studentTakenExam = await answerQuestionModel.findOne({
      regno: value.regno,
      subject: value.subject,
      class: studentClass,
    });

    if (studentTakenExam)
      return res
        .status(403)
        .json({ message: "you have taken this subject exam already" });

    const questions = await questionModel.find({
      class: studentClass,
      subject: value.subject,
    });

    if (!questions)
      return res.status(400).json({
        message:
          "there is no available questions for this subject at the moment",
      });

    res.status(200).json({
      message: "Below are the questions you are to answer",
      data: questions,
    });
  } catch (error) {
    res.status(500).json({ message: "failed to fetch questions", data: error });
  }
};

module.exports = fetchQuestions;
