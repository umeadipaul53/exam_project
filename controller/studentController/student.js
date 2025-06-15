const { studentModel } = require("../../model/student_account.model");

const Student = async (req, res) => {
  const user = await studentModel
    .findById(req.user.id)
    .select("id email fullname role");

  if (!user) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json({
    id: user.id,
    email: user.email,
    fullname: user.fullname,
    role: user.role,
  });
};

module.exports = Student;
