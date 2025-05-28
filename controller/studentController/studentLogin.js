const sanitize = require("mongo-sanitize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  studentModel,
  loginValidationSchema,
  tokenModel,
} = require("../../model/student_account.model");

// Create JWTs
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

//generate refresh access token
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

const loginStudent = async (req, res) => {
  try {
    //sanitize data
    const sanitizedData = {
      username: sanitize(req.body.username),
      password: sanitize(req.body.password),
    };

    //validate
    const { error, value } = loginValidationSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const account = await studentModel.findOne({
      username: value.username,
    });

    if (!account) {
      return res.status(401).json({ message: "Username does not exist" });
    }

    const isMatch = await bcrypt.compare(value.password, account.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Username and password" });
    }

    const accesstoken = generateAccessToken(account);
    const refreshToken = generateRefreshToken(account);

    await tokenModel.create({
      tokenId: account.id,
      token: refreshToken,
    });

    res.status(200).json({
      message: `welcome ${value.username}`,
      student: {
        id: account.id,
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
