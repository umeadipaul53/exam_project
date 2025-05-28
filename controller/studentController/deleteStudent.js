const { studentModel } = require("../../model/student_account.model");

const deleteStudentRecord = async (req, res) => {
  try {
    const deleteStudent = await studentModel.findByIdAndDelete(req.params.id);

    res
      .status(201)
      .json({ message: "student information has been deleted successfully" });
  } catch (err) {
    res
      .status()
      .json({ message: "failed to delete student record", data: err });
  }
};

module.exports = deleteStudentRecord;
