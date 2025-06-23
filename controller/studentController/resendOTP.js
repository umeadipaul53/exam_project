const sanitize = require("mongo-sanitize");
const { studentModel } = require("../../model/student_account.model");
const {
  twoFactorModel,
  validateResendOTP,
} = require("../../model/twoFactor-model");
const { sendEmail } = require("../../email/emailServices");

const resendOTP = async (req, res) => {
  try {
    const sanitizedData = {
      userId: sanitize(req.body.id),
    };

    const { error, value } = validateResendOTP.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await studentModel.findOne({ _id: value.userId });
    if (!user) {
      return res.status(404).json({ error: "Account not found." });
    }

    const twoFactorCode = String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      "0"
    );

    await twoFactorModel.deleteMany({ userId: user._id });

    try {
      const createFA = await twoFactorModel.create({
        userId: value.userId,
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

    const name = user.username;

    const sentMail = await sendEmail({
      to: user.email,
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
        id: user._id,
        username: user.username,
        email: user.email,
        regno: user.regno,
      },
    });
  } catch (error) {
    console.error("resendCode error:", error);
    return res.status(500).json({
      message: "Could not resend two factor code",
      error: error.message,
    });
  }
};

module.exports = resendOTP;
