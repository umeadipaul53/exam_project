const sanitize = require("mongo-sanitize");
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
    });

    if (studentTakenExam)
      return res
        .status(403)
        .json({ message: "you have taken this subject exam already" });

    const newExam = await ExamSessionModel.create({
      regno: value.regno,
      subject: value.subject,
      class: value.class,
    });

    res.status(201).json({ sessionId: newExam._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "failed to start exam for the student", data: error });
  }
};

module.exports = startExam;
