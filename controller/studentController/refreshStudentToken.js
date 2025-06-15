const jwt = require("jsonwebtoken");
const { tokenModel } = require("../../model/student_account.model");
const { generateAccessToken } = require("../../middleware/tokens");

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(400).json({ message: "No refresh token" });

  const savedToken = await tokenModel.findOne({ token: refreshToken });
  if (!savedToken) return res.status(400).json({ message: "Token not found" });

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return res.status(403).json({ message: "Invalid Token" });
  }

  const accessToken = generateAccessToken({
    id: decoded.id,
    role: decoded.role,
  });

  res.json({ accessToken });
};

module.exports = refreshToken;
