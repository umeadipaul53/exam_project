const { tokenModel } = require("../../model/student_account.model");

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(400).json({ message: "No refresh token" });
  console.log("COOKIES:", req.cookies);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/student/refresh-token", // match the original path
  });

  await tokenModel.deleteOne({ token: refreshToken });
  res.json({ message: "logged out" });
};

module.exports = logout;
