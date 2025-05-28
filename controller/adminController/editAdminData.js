const sanitize = require("mongo-sanitize");
const {
  adminModel,
  adminUpdateValidationSchema,
} = require("../../model/admin.model");

const updateAdminProfile = async (req, res) => {
  try {
    const sanitizedData = {
      fullname: sanitize(req.body.fullname),
    };

    const { err, value } = adminUpdateValidationSchema.validate(sanitizedData);
    if (err) {
      return res.status(401).json({ message: err.details[0].message });
    }

    const updateInfo = await adminModel.findByIdAndUpdate(
      req.params.id,
      {
        fullname: value.fullname,
      },
      { new: true }
    );

    res.status(201).json({
      message: "updated admin profile information",
      data: updateInfo,
    });
  } catch (err) {
    res
      .status(401)
      .json({ message: "failed to update admin information", data: err });
  }
};

module.exports = updateAdminProfile;
