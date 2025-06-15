const { tokenModel } = require("../../model/student_account.model");
const isProduction = process.env.NODE_ENV === "production";

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(400).json({ message: "No refresh token" });
  console.log("COOKIES:", req.cookies);

  await tokenModel.deleteOne({ token: refreshToken });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction, // true in production (HTTPS only)
    sameSite: isProduction ? "None" : "Lax", // "None" for cross-site, "Lax" for local dev
    path: "/student/refresh-token",
  });

  res.json({ message: "logged out successfully" });
};

module.exports = logout;
