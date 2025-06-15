function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Role not allowed." });
    }
    next();
    console.log("User Role:", req.user.role);
  };
}

module.exports = authorizeRoles;
