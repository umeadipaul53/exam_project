const jwt = require("jsonwebtoken");
const { tokenModel } = require("../../model/student_account.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../middleware/tokens");
const isProduction = process.env.NODE_ENV === "production";
const { studentModel } = require("../../model/student_account.model");

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(400).json({ message: "No refresh token" });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }

    if (!decoded.tokenId)
      return res
        .status(400)
        .json({ message: "Missing token ID in refresh token" });

    const savedToken = await tokenModel.findOne({ tokenId: decoded.tokenId });
    if (!savedToken)
      return res.status(403).json({ message: "Refresh token reuse detected" });

    // Delete old refresh token
    await tokenModel.deleteOne({ tokenId: decoded.tokenId });

    const user = await studentModel.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    //generate new accesstoken
    const newAccessToken = generateAccessToken(user);

    //generate a token id for the user
    const newtokenId = crypto.randomUUID();

    //generate new refresh token
    const newRefreshToken = generateRefreshToken(user, newtokenId);

    //save new refresh token
    await tokenModel.create({
      tokenId: newtokenId,
      token: newRefreshToken,
      userId: user._id,
    });

    // Send back new tokens
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax", // "None" for cross-site, "Lax" for local dev
      path: "/student",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ accesstoken: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Refresh token error" });
  }
};

module.exports = refreshToken;
