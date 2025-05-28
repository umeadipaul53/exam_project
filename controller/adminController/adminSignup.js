const sanitize = require("mongo-sanitize");
const bcrypt = require("bcrypt");
const {
  adminModel,
  adminValidationSchema,
} = require("../../model/admin.model");

const registerAdmin = async (req, res) => {
  try {
    const sanitizedData = {
      email: sanitize(req.body.email),
      password: sanitize(req.body.password),
      fullname: sanitize(req.body.fullname),
      role: sanitize(req.body.role),
    };

    // Validate sanitized data
    const { error, value } = adminValidationSchema.validate(sanitizedData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if email already exists
    const existingEmail = await adminModel.findOne({ email: value.email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(value.password, 10);

    //register student to the database
    const newadmin = await adminModel.create({
      email: value.email,
      password: hashedPassword,
      fullname: value.fullname,
      role: value.role,
    });

    res.status(201).json({
      message: "Admin Created",
      data: {
        id: newadmin.id,
        email: newadmin.email,
        fullname: newadmin.fullname,
        role: newadmin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "failed to create admin",
      data: error.message,
    });
  }
};

module.exports = registerAdmin;
