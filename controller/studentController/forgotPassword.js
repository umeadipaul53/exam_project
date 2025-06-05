const sanitize = require("mongo-sanitize");
const { generateAccessToken } = require("../../middleware/tokens");
const {
  studentModel,
  resendTokenValidationSchema,
  verifyTokenModel,
} = require("../../model/student_account.model");
const crypto = require("crypto");
const { sendEmail } = require("../../email/emailServices");

const forgotPass = async (req, res) => {
  try {
    const sanitizedData = {
      email: sanitize(req.body.email),
    };

    const { error, value } =
      resendTokenValidationSchema.validate(sanitizedData);

    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const student = await studentModel.findOne({ email: value.email });
    if (!student)
      return res.status(400).json({ message: "Email does not exist" });

    const token = generateAccessToken(student);
    const hash = crypto.createHash("sha256").update(token).digest("hex");

    await verifyTokenModel.create({
      tokenId: student.id,
      hash: hash,
    });

    const name = student.username;
    const verifyUrl = `https://exam-project-asw4.onrender.com/student/change_password?token=${token}`;

    await sendEmail({
      to: value.email,
      subject: "Forgot password",
      templateName: "forgotpassword",
      variables: {
        name,
        verifyUrl,
      },
    });

    res.status(201).json({
      message: "Student registered. Check your email.",
      data: {
        email: student.email,
        link: verifyUrl,
        token: token,
      },
    });
  } catch (error) {
    res
      .status()
      .json({ message: "could't send the forgot password link", data: error });
  }
};

module.exports = forgotPass;
