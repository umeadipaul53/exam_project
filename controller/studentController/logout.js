const { tokenModel } = require("../../model/student_account.model");

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  res.clearCookie("refreshToken");
  await tokenModel.deleteOne({ token: refreshToken });
  res.json({ message: "logged out" });
};

module.exports = logout;
