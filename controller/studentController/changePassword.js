const sanitize = require("mongo-sanitize");
const bcrypt = require("bcrypt");
const {
  studentModel,
  verifyTokenModel,
  changePasswordValidationSchema,
  tokenValidationSchema,
} = require("../../model/student_account.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const changePassPage = async (req, res) => {
  try {
    const sanitizedData = {
      token: sanitize(req.query.token),
    };

    const { error, value } = tokenValidationSchema.validate(sanitizedData);

    if (error)
      return res.status(403).json({ message: error.details[0].message });

    const tokenMain = value.token;
    let verifyToken;
    try {
      verifyToken = jwt.verify(tokenMain, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token expired" });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Invalid token" });
      }
      throw error; // re-throw for general catch
    }

    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    res.status(403).json({ message: "token not verified" });
  }
};

const handlechangePass = async (req, res) => {
  try {
    const sanitizedData = {
      token: sanitize(req.body.token),
      newPass: sanitize(req.body.newPass),
      confirmPass: sanitize(req.body.confirmPass),
    };

    const { error, value } =
      changePasswordValidationSchema.validate(sanitizedData);

    if (error)
      return res.status(403).json({ message: error.details[0].message });

    let payload;
    try {
      payload = jwt.verify(value.token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).send({ error: "Invalid or expired token" });
    }

    await verifyTokenModel.deleteMany({ tokenId: payload.id });

    const account = await studentModel.findById(payload.id);

    if (!account) return res.status(404).json({ message: "Student not found" });

    const hashPass = await bcrypt.hash(value.newPass, 10);

    account.password = hashPass;
    await account.save();
    res.status(200).json({
      message:
        "Password updated successfully, you can now login with your new password",
    });
  } catch (error) {
    res.status(403).json({ message: "could not change password" });
  }
};

module.exports = { changePassPage, handlechangePass };
