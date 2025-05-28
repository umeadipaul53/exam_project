const express = require("express");
const admin = express.Router();
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const setQuestions = require("../controller/questionController/setQuestion");
const deleteStudentRecord = require("../controller/studentController/deleteStudent");
const allStudents = require("../controller/studentController/view_allStudents");
const registerAdmin = require("../controller/adminController/adminSignup");
const loginAdmin = require("../controller/adminController/adminLogin");
const adminprofilePage = require("../controller/adminController/adminProfile");
const updateAdminProfile = require("../controller/adminController/editAdminData");
const logout = require("../controller/studentController/logout");

//admin account access routes
admin.route("/sign_up").post(registerAdmin);
admin.route("/login").post(loginAdmin);

//admin account routes
admin
  .route("/delete_student_account/:id")
  .delete(authenticateToken, authorizeRoles("admin"), deleteStudentRecord);
admin
  .route("/admin_profile/:id")
  .get(authenticateToken, authorizeRoles("admin"), adminprofilePage);
admin
  .route("/edit_profile/:id")
  .patch(authenticateToken, authorizeRoles("admin"), updateAdminProfile);
admin
  .route("/setquestion")
  .post(authenticateToken, authorizeRoles("admin"), setQuestions);
admin
  .route("/allstudents")
  .get(authenticateToken, authorizeRoles("admin"), allStudents);
admin.route("/logout").post(authenticateToken, authorizeRoles("admin"), logout);

module.exports = admin;
