const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineString } = require("firebase-functions/params");
const nodemailer = require("nodemailer");

const gmailAppPassword = defineString("GMAIL_APP_PASSWORD");

exports.onAssessmentRequest = onDocumentCreated(
  { document: "assessment_requests/{docId}" },
  async (event) => {
    const data = event.data.data();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pradyoth.ai@gmail.com",
        pass: gmailAppPassword.value(),
      },
    });

    await transporter.sendMail({
      from: '"KnowYourAI" <pradyoth.ai@gmail.com>',
      to: "ppradyoth64@gmail.com",
      replyTo: data.email,
      subject: `New Assessment Request: ${data.name} (${data.company})`,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Company: ${data.company}`,
        `Service: ${data.service}`,
        `Timeline: ${data.timeline}`,
        ``,
        `System Description:`,
        data.system_description,
        ``,
        `Concerns:`,
        data.concerns || "None provided",
      ].join("\n"),
    });
  });
