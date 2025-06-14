const sanitize = require("mongo-sanitize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { tokenModel } = require("../../model/student_account.model");
const {
  adminModel,
  loginValidationSchema,
} = require("../../model/admin.model");

// Create JWTs
// generate access token
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
}

//generate refresh access token
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

const loginAdmin = async (req, res) => {
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

    const account = await adminModel.findOne({
      email: value.email,
    });

    if (!account) {
      return res.status(401).json({ message: "Email does not exist" });
    }

    const isMatch = await bcrypt.compare(value.password, account.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Email and password" });
    }

    const accesstoken = generateAccessToken(account);
    const refreshToken = generateRefreshToken(account);

    await tokenModel.create({
      tokenId: account.id,
      token: refreshToken,
    });

    res.status(200).json({
      message: `welcome ${account.fullname}`,
      admin: {
        id: account.id,
        email: account.email,
      },
      accesstoken,
      refreshToken,
    });
  } catch (error) {
    res.status(401).json({
      message: "failed to login admin",
      data: error,
    });
  }
};

module.exports = loginAdmin;
