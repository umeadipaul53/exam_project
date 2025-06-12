const { adminModel } = require("../../model/admin.model");

const Student = async (req, res) => {
  const admin = adminModel.find((u) => u.id === req.user.id);
  res.json({
    id: admin.id,
    email: admin.email,
    fullname: admin.fullname,
    role: admin.role,
  });
  res.json({ user: req.user });
};

module.exports = Student;
