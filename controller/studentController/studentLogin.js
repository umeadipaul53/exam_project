const sanitize = require("mongo-sanitize");
const bcrypt = require("bcrypt");
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
const { twoFactorModel } = require("../../model/twoFactor-model");
const { sendEmail } = require("../../email/emailServices");

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

    const twoFactorCode = String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      "0"
    );

    if (account.twofactor === false) {
      //generate a token id for the user
      const newtokenId = crypto.randomUUID();

      //generate access token and refreshToken
      const accesstoken = generateAccessToken(account);
      const refreshToken = generateRefreshToken(account, newtokenId);

      try {
        await tokenModel.create({
          tokenId: newtokenId,
          token: refreshToken,
          userId: account._id,
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
        message: `welcome ${account.fullname}`,
        student: {
          id: account._id,
          username: account.username,
          email: account.email,
          regno: account.regno,
        },
        accesstoken,
        twofactor: false,
      });
    } else {
      await twoFactorModel.deleteMany({ userId: account._id });

      try {
        const createFA = await twoFactorModel.create({
          userId: account._id,
          code: twoFactorCode,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });
      } catch (error) {
        console.error("Error creating 2FA entry:", error);
        return res.status(500).json({
          message: "Could not create 2FA entry",
          error: error.message,
        });
      }

      const name = account.username;

      const sentMail = await sendEmail({
        to: value.email,
        subject: "2FA authentication CBT Application",
        templateName: "twoFaauthentication",
        variables: {
          name,
          twoFactorCode,
        },
      });

      console.log("Email sent?", sentMail);

      if (!sentMail) {
        return res.status(500).json({
          message: "Failed to send 2FA email",
        });
      }

      return res.status(200).json({
        message: "2FA Code generated successfully",
        student: {
          id: account._id,
          username: account.username,
          email: account.email,
          regno: account.regno,
        },
        twofactor: true,
      });
    }
  } catch (error) {
    res.status(401).json({
      message: "failed to login this student",
      data: error,
    });
  }
};

module.exports = loginStudent;
