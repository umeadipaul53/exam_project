const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");
const handlebars = require("handlebars");
const mjmlModule = require("mjml");

// Safe fallback for mjml in case it's wrapped in a `.default`
const mjml = typeof mjmlModule === "function" ? mjmlModule : mjmlModule.default;

//initialise resend with your api key
const resend = new Resend(process.env.RESEND_API_KEY);

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

    if (errors && errors.length > 0) {
      throw new Error("MJML compilation error: " + JSON.stringify(errors));
    }

    //send email using Resend
    const response = await resend.emails.send({
      from: "Exam-Project <noreply@examsproject.softcodemicrosystem.com>",
      to,
      subject,
      html,
    });

    console.log("Email sent via Resend:", response);
    return response;
  } catch (error) {
    console.error("Failed to send email via Resend:", error.message);
    return false; // ✅ Add this to indicate failure
  }
}

module.exports = {
  sendEmail,
};
