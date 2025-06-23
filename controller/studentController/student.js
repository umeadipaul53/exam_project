const { studentModel } = require("../../model/student_account.model");

const Student = async (req, res) => {
  const user = await studentModel
    .findById(req.user.id)
    .select("id email fullname class regno role twofactor");

  if (!user) {
    return res.status(404).json({ message: "Student not found" });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullname: user.fullname,
    class: user.class,
    regno: user.regno,
    twofactor: user.twofactor,
    role: user.role,
  });
};

module.exports = Student;
