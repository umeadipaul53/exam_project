const sanitize = require("mongo-sanitize");
const { questionModel } = require("../../model/set_exam_question.model");
const {
  ExamSessionModel,
  ExamSessionModelValidationSchema,
} = require("../../model/ExamSessionSchema.model");

const startExam = async (req, res) => {
  try {
    const sanitizedData = {
      regno: sanitize(req.body.regno),
      subject: sanitize(req.body.subject),
      class: sanitize(req.body.class),
      year: sanitize(req.body.year),
    };

    const { error, value } =
      ExamSessionModelValidationSchema.validate(sanitizedData);

    if (error)
      return res.status(403).json({ message: error.details[0].message });

    //verify if the student has taken the exam before
    const studentTakenExam = await ExamSessionModel.findOne({
      regno: value.regno,
      subject: value.subject,
      class: value.class,
      year: value.year,
    });

    if (studentTakenExam)
      return res
        .status(403)
        .json({ message: "you have taken this subject exam already" });

    const currentYear = new Date().getFullYear();

    const filter = {
      subject: value.subject,
      class: value.class,
      year: value.year,
    };

    const numberQuestions = await questionModel.find(filter);
    const max = numberQuestions.reduce((sum, ans) => sum + (ans.marks || 0), 0);

    try {
      const newExam = await ExamSessionModel.create({
        regno: value.regno,
        subject: value.subject,
        class: value.class,
        year: value.year,
        maxScore: max,
      });

      res.status(201).json({ sessionId: newExam._id });
    } catch (error) {
      if (error.code === 11000) {
        // Already exists, find and return it
        const existingSession = await ExamSessionModel.findOne({
          regno: value.regno,
          subject: value.subject,
          class: value.class,
          year: value.year,
        });
        return res.status(200).json({ sessionId: existingSession._id });
      }

      res.status(500).json({ message: "Something went wrong", error: error });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "failed to start exam for the student", data: error });
  }
};

module.exports = startExam;
