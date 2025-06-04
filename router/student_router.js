const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");
const registerStudent = require("../controller/studentController/studentRegistration");
const loginStudent = require("../controller/studentController/studentLogin");
const updateStudentProfile = require("../controller/studentController/editStudentData");
const logout = require("../controller/studentController/logout");
const profilePage = require("../controller/studentController/studentProfile");
const refreshToken = require("../controller/studentController/refreshStudentToken");
const fetchQuestions = require("../controller/questionController/fetchQuestionController");
const startExam = require("../controller/examController/startExam");
const submitAnswer = require("../controller/examController/submitAnswer");
const finishExam = require("../controller/examController/finishExam");
const verifyStudentAccount = require("../controller/studentController/verifyStudentAccount");
const resendToken = require("../controller/studentController/resendVerification");

//Student Account Access routes
router.route("/student_registration").post(registerStudent);
router.route("/login").post(loginStudent);
router.route("/verify").put(verifyStudentAccount);
router.route("/resend-verication-token").post(resendToken);

//student account routes
router
  .route("/refresh-token")
  .post(authenticateToken, authorizeRoles("user"), refreshToken);
router.route("/logout").post(authenticateToken, authorizeRoles("user"), logout);
router
  .route("/student-profile/:id")
  .get(authenticateToken, authorizeRoles("user"), profilePage);
router
  .route("/update_student_information/:id")
  .patch(authenticateToken, authorizeRoles("user"), updateStudentProfile);
router
  .route("/take_exam")
  .get(authenticateToken, authorizeRoles("user"), fetchQuestions);
router
  .route("/start-exam")
  .post(authenticateToken, authorizeRoles("user"), startExam);
router
  .route("/submit-answer")
  .patch(authenticateToken, authorizeRoles("user"), submitAnswer);
router
  .route("/finish-exam")
  .patch(authenticateToken, authorizeRoles("user"), finishExam);

module.exports = router;
