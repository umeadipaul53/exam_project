const sanitize = require("mongo-sanitize");
const { validateResendOTP } = require("../../model/twoFactor-model");
const { studentModel } = require("../../model/student_account.model");
const mongoose = require("mongoose");

const disAble2FA = async (req, res) => {
  try {
    const sanitizedData = {
      userId: sanitize(req.user.id),
    };

    const { error, value } = validateResendOTP.validate(sanitizedData);

    if (error)
      return res.status(500).json({ message: error.details[0].message });

    if (!mongoose.Types.ObjectId.isValid(value.userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await studentModel.findOneAndUpdate(
      { _id: value.userId },
      { $set: { twofactor: false } }, // or false for disable
      { new: true }
    );

    if (!user)
      return res
        .status(404)
        .json({ message: "User account not found, kindly login again" });

    if (user.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found or 2FA already disabled." });
    }

    res.json({ message: "2FA has been disabled." });
  } catch (error) {
    res.status(500).json({ message: "could not disable 2FA" });
  }
};

const enAble2FA = async (req, res) => {
  try {
    const sanitizedData = {
      userId: sanitize(req.user.id),
    };

    const { error, value } = validateResendOTP.validate(sanitizedData);

    if (error)
      return res.status(500).json({ message: error.details[0].message });

    if (!mongoose.Types.ObjectId.isValid(value.userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await studentModel.findOneAndUpdate(
      { _id: value.userId },
      { $set: { twofactor: true } }, // or false for disable
      { new: true }
    );

    if (!user)
      return res
        .status(404)
        .json({ message: "User account not found, kindly login again" });

    if (user.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found or 2FA already enabled." });
    }

    res.json({ message: "2FA has been enabled." });
  } catch (error) {
    res.status(500).json({ message: "could not enable 2FA" });
  }
};

module.exports = { disAble2FA, enAble2FA };
