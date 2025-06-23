const sanitize = require("mongo-sanitize");
const {
  studentModel,
  studentUpdateValidationSchema,
} = require("../../model/student_account.model");

const updateStudentProfile = async (req, res) => {
  try {
    const sanitizedData = {
      fullname: sanitize(req.body.fullname),
      phone_number: sanitize(req.body.phone_number),
      class: sanitize(req.body.class),
    };

    const { err, value } =
      studentUpdateValidationSchema.validate(sanitizedData);
    if (err) {
      return res.status(401).json({ message: err.details[0].message });
    }

    if (!req.params.id) {
      return res.status(400).json({ message: "Missing student ID in request" });
    }

    const updateInfo = await studentModel.findByIdAndUpdate(
      req.params.id,
      {
        fullname: value.fullname,
        phone_number: value.phone_number,
        class: value.class,
      },
      { new: true }
    );

    res.status(201).json({
      message: "updated student profile information",
      data: updateInfo,
    });
  } catch (err) {
    res
      .status(401)
      .json({ message: "failed to update student information", data: err });
  }
};

module.exports = updateStudentProfile;
