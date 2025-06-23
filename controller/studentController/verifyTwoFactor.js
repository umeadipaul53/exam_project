const {
  twoFactorModel,
  validateTwoFactorInput,
} = require("../../model/twoFactor-model");
const sanitize = require("mongo-sanitize");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../middleware/tokens");
const {
  studentModel,
  tokenModel,
} = require("../../model/student_account.model");
const isProduction = process.env.NODE_ENV === "production";

const verifyTwoFA = async (req, res) => {
  try {
    const sanitizedData = {
      userId: sanitize(req.body.id),
      codeEntered: sanitize(req.body.code),
    };

    const { error, value } = validateTwoFactorInput.validate(sanitizedData);

    if (error)
      return res.status(403).json({ message: error.details[0].message });

    const verifyCode = await twoFactorModel.findOne({
      userId: value.userId,
      code: value.codeEntered,
    });

    if (!verifyCode) return res.status(400).json({ message: "Invalid Code " });

    if (Date.now() > verifyCode.expiresAt) {
      return res.status(400).json({ message: "Code expired" });
    }

    const account = await studentModel.findById(value.userId);
    //generate a token id for the user
    const newtokenId = crypto.randomUUID();

    console.log(account);
    //generate access token and refreshToken
    const accesstoken = generateAccessToken(account);
    const refreshToken = generateRefreshToken(account, newtokenId);

    try {
      await tokenModel.create({
        tokenId: newtokenId,
        token: refreshToken,
        userId: value.userId,
      });
    } catch (error) {
      console.error("Error saving refresh token:", error);
      throw new Error("Internal server error");
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction, // true in production (HTTPS only)
      sameSite: isProduction ? "None" : "Lax", // "None" for cross-site, "Lax" for local dev
      path: "/student",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      accesstoken,
      refreshToken,
    });
  } catch (error) {
    res.status(403).json({ message: "could not verify..." });
  }
};

module.exports = verifyTwoFA;
