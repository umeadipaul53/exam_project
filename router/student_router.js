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
const forgotPass = require("../controller/studentController/forgotPassword");
const {
  changePassPage,
  handlechangePass,
} = require("../controller/studentController/changePassword");
const Student = require("../controller/studentController/student");
const fetchExam = require("../controller/examController/fetchExam");
const fetchAllResults = require("../controller/resultController/fetchAllResult");

//Student Account Access routes
router.route("/student_registration").post(registerStudent);
router.route("/login").post(loginStudent);
//this is done beause its a link that is clicked although only get works too
router.route("/verify").get(verifyStudentAccount);
router.route("/resend-verication-token").post(resendToken);
router.route("/forgot_password").post(forgotPass);
router.route("/change_password").get(changePassPage);
router.route("/change_password").put(handlechangePass);

//student account routes
router.route("/user").get(authenticateToken, authorizeRoles("user"), Student);
router.route("/refresh-token").post(refreshToken);

router
  .route("/student-profile/:id")
  .get(authenticateToken, authorizeRoles("user"), profilePage);
router
  .route("/update_student_information/:id")
  .patch(authenticateToken, authorizeRoles("user"), updateStudentProfile);
router
  .route("/fetch-exam")
  .get(authenticateToken, authorizeRoles("user"), fetchExam);
router
  .route("/start-exam")
  .post(authenticateToken, authorizeRoles("user"), startExam);
router
  .route("/fetch_questions")
  .get(authenticateToken, authorizeRoles("user"), fetchQuestions);
router
  .route("/submit-answer")
  .patch(authenticateToken, authorizeRoles("user"), submitAnswer);
router
  .route("/finish-exam")
  .patch(authenticateToken, authorizeRoles("user"), finishExam);
router
  .route("/fetch-result")
  .get(authenticateToken, authorizeRoles("user"), fetchAllResults);
router.route("/logout").post(logout);

module.exports = router;
