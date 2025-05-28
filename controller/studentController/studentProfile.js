const { studentModel } = require("../../model/student_account.model");

const profilePage = async (req, res) => {
  try {
    const student = await studentModel.findById(req.params.id);
    res.json({
      data: student,
    });
  } catch (error) {
    res.status(500).json({ message: "failed to fetch profile", data: error });
  }
};

module.exports = profilePage;
