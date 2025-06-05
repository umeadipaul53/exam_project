const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const mjmlModule = require("mjml");

// Safe fallback for mjml in case it's wrapped in a `.default`
const mjml = typeof mjmlModule === "function" ? mjmlModule : mjmlModule.default;

const transporter = nodemailer.createTransport({
  host: "premium29.web-hosting.com",
  port: 465, // or 587 depending on the provider
  secure: true, // true for 465, false for 587 usually
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, templateName, variables }) {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      `${templateName}.mjml`
    );

    const mjmlRaw = fs.readFileSync(templatePath, "utf-8");

    const compiledTemplate = handlebars.compile(mjmlRaw);
    const mjmlCompiled = compiledTemplate(variables);

    if (typeof mjml !== "function") {
      throw new Error("mjml is not a function");
    }

    const { html, errors } = mjml(mjmlCompiled);

    if (errors.length > 0) {
      throw new Error("MJML compilation error: " + JSON.stringify(errors));
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw error;
  }
}

module.exports = {
  sendEmail,
};
