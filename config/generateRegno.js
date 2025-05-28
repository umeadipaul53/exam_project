const { studentModel, countModel } = require("../model/student_account.model");

const generateRegno = async ({ schoolCode }) => {
  const year = new Date().getFullYear();
  const key = `${year}/${schoolCode}`;

  // Atomically increment or create the counter
  const counter = await countModel.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const serial = String(counter.seq).padStart(3, "0");
  return `${key}/${serial}`;
};

module.exports = generateRegno;
