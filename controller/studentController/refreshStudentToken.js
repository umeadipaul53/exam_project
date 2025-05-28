const jwt = require("jsonwebtoken");
const { tokenModel } = require("../../model/student_account.model");

// generate access token
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
}

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "No refresh token" });

  const savedToken = await tokenModel.findOne({ token: refreshToken });
  if (!savedToken) return res.status(400).json({ message: "token not found" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    const accesstoken = generateAccessToken({ id: user.id });
    res.json({ accesstoken });
  });
};

module.exports = refreshToken;
