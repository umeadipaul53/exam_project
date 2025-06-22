const jwt = require("jsonwebtoken");
const { tokenModel } = require("../../model/student_account.model");
const isProduction = process.env.NODE_ENV === "production";

const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token" });
  }

  try {
    // 1. Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.id;

    // 2. Delete ALL refresh tokens for this user
    await tokenModel.deleteMany({ userId });

    // 3. Clear the cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/student", // ✅ must match what was used when setting the cookie
    });

    return res.json({ message: "Logged out from all devices" });
  } catch (err) {
    console.error("Logout token verify failed:", err.message);

    // Still clear cookie even if token is invalid
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/student",
    });

    return res.status(400).json({ message: "Invalid refresh token" });
  }
};

module.exports = logout;
