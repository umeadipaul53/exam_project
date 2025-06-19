const sanitize = require("mongo-sanitize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  studentModel,
  loginValidationSchema,
  tokenModel,
} = require("../../model/student_account.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../middleware/tokens");
const isProduction = process.env.NODE_ENV === "production";

const loginStudent = async (req, res) => {
  try {
    //sanitize data
    const sanitizedData = {
      email: sanitize(req.body.email),
      password: sanitize(req.body.password),
    };

    //validate
    const { error, value } = loginValidationSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const account = await studentModel.findOne({
      email: value.email,
    });

    if (!account) {
      return res.status(401).json({ message: "Email does not exist" });
    }

    const isMatch = await bcrypt.compare(value.password, account.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email and password" });
    }

    if (account.verified === false) {
      return res.status(401).json({ message: "Please verify your account" });
    }

    const accesstoken = generateAccessToken(account);
    const refreshToken = generateRefreshToken(account);

    await tokenModel.create({
      tokenId: account._id,
      token: refreshToken,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction, // true in production (HTTPS only)
      sameSite: isProduction ? "None" : "Lax", // "None" for cross-site, "Lax" for local dev
      path: "/student/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: `welcome ${account.fullname}`,
      student: {
        id: account._id,
        username: account.username,
        email: account.email,
      },
      accesstoken,
      refreshToken,
    });
  } catch (error) {
    res.status(401).json({
      message: "failed to login this student",
      data: error,
    });
  }
};

module.exports = loginStudent;
