const { studentModel } = require("../../model/student_account.model");

const allStudents = async (req, res) => {
  try {
    const students = await studentModel.find();
    res.status(201).json({
      message: "All students in the portal",
      data: students,
    });
  } catch (err) {
    res
      .status(401)
      .json({ message: "could not fetch any student information", data: err });
  }
};

module.exports = allStudents;
