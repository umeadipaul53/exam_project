const Student = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = Student;
