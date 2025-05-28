const { adminModel } = require("../../model/admin.model");

const adminprofilePage = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.params.id);
    res.json({
      data: admin,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "failed to fetch admin profile", data: error });
  }
};

module.exports = adminprofilePage;
