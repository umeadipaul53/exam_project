const { studentModel } = require("../../model/student_account.model");

const Student = async (req, res) => {
  const student = studentModel.find((u) => u.id === req.user.id);
  res.json({
    id: student.id,
    email: student.email,
    fullname: student.fullname,
    role: student.role,
  });
  res.json({ user: req.user });
};

module.exports = Student;
