const { studentModel } = require("../../model/student_account.model");

const profilePage = async (req, res) => {
  try {
    const userId = req.query.id;
    const student = await studentModel.findById(userId);

    res.json({
      id: student._id,
      email: student.email,
      regno: student.regno,
      fullname: student.fullname,
      class: student.class,
      phone: student.phone_number,
      username: student.username,
    });
  } catch (error) {
    res.status(500).json({ message: "failed to fetch profile", data: error });
  }
};

module.exports = profilePage;
