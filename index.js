const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT;

const studentRouter = require("./router/student_router");
const adminRouter = require("./router/admin_router");

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "server up and running" });
});

app.use("/student", studentRouter);
app.use("/admin", adminRouter);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
