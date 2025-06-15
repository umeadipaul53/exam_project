const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();

const port = process.env.PORT || 2206;
app.use(express.json());
app.use(cookieParser());

const isProduction = process.env.NODE_ENV === "production";
const frontendURL = isProduction
  ? "https://exam-project-asw4.onrender.com"
  : "http://localhost:5173";

app.use(
  cors({
    origin: frontendURL,
    credentials: true, // must match with Axios `withCredentials: true`
  })
);

const studentRouter = require("./router/student_router");
const adminRouter = require("./router/admin_router");

app.get("/", (req, res) => {
  res.status(200).json({ message: "server up and running" });
});

app.use("/student", studentRouter);
app.use("/admin", adminRouter);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
