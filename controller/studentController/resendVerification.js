const sanitize = require("mongo-sanitize");
const crypto = require("crypto");
const {
  studentModel,
  resendTokenValidationSchema,
  verifyTokenModel,
} = require("../../model/student_account.model");
const { sendEmail } = require("../../email/emailServices");
const { generateAccessToken } = require("../../middleware/tokens");

const resendToken = async (req, res) => {
  try {
    const sanitizedData = {
      email: sanitize(req.body.email),
    };

    const { error, value } =
      resendTokenValidationSchema.validate(sanitizedData);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const user = await studentModel.findOne({ email: value.email });
    if (!user) return res.status(404).json({ error: "Email not found." });

    if (user.verified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    // Generate token and hash it
    const token = generateAccessToken(user); // Or a random string for better practice
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    // Store hashed token with user reference
    await verifyTokenModel.create({
      tokenId: user._id,
      hash: hashed,
    });

    const verifyUrl = `http://localhost:2206/student/verify?token=${token}`;
    // Send email
    await sendEmail({
      to: value.email,
      subject: "Verify your email",
      templateName: "welcome",
      variables: {
        fullname: user.fullname,
        verifyUrl,
      },
    });

    res
      .status(201)
      .json({ message: "Verification email resent.", data: token });
  } catch (error) {
    console.error(error); // for debugging
    res.status(500).json({
      message: "Could not resend token verification",
      error: error.message,
    });
  }
};

module.exports = resendToken;
