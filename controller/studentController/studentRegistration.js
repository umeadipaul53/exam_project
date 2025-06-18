const sanitize = require("mongo-sanitize");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  studentModel,
  studentValidationSchema,
  verifyTokenModel,
} = require("../../model/student_account.model");
const generateRegno = require("../../config/generateRegno");
const { sendEmail } = require("../../email/emailServices");
const { generateAccessToken } = require("../../middleware/tokens");

const registerStudent = async (req, res) => {
  try {
    const SCHOOL_CODE = "CES";
    // Sanitize input fields to prevent NoSQL injection
    const sanitizedData = {
      username: sanitize(req.body.username),
      email: sanitize(req.body.email),
      password: sanitize(req.body.password),
      fullname: sanitize(req.body.fullname),
      phone_number: sanitize(req.body.phone_number),
      role: sanitize(req.body.role),
      class: sanitize(req.body.class),
    };

    // Validate sanitized data
    const { error, value } = studentValidationSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if username already exists
    const existingUser = await studentModel.findOne({
      username: value.username,
    });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Check if email already exists
    const existingEmail = await studentModel.findOne({ email: value.email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const regNum = await generateRegno({ schoolCode: SCHOOL_CODE });
    // Hash the password
    const hashedPassword = await bcrypt.hash(value.password, 10);

    //register student to the database
    const newStudent = await studentModel.create({
      username: value.username,
      email: value.email,
      password: hashedPassword,
      fullname: value.fullname,
      phone_number: value.phone_number,
      role: value.role,
      class: value.class,
      schoolCode: SCHOOL_CODE,
      regno: regNum,
    });

    const name = value.fullname;
    const token = generateAccessToken(newStudent);

    // Hash the token generated
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    await verifyTokenModel.create({
      tokenId: newStudent.id,
      hash: hashed,
    });

    const verifyUrl = `https://exam-project-frontend.vercel.app/verify-student-account?token=${token}`;

    await sendEmail({
      to: value.email,
      subject: "welcome to our CBT Application",
      templateName: "welcome",
      variables: {
        name,
        verifyUrl,
      },
    });

    res.status(201).json({
      message: "Student registered. Check your email to verify your account.",
      data: {
        id: newStudent.id,
        username: newStudent.username,
        email: newStudent.email,
        fullname: newStudent.fullname,
        phone_number: newStudent.phone_number,
        role: newStudent.role,
        class: newStudent.class,
        schoolCode: newStudent.schoolCode,
        regno: newStudent.regno,
        link: verifyUrl,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "failed to register student",
      data: error.message,
    });
  }
};

module.exports = registerStudent;
