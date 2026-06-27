import nodemailer from "nodemailer";
import dotEnv from "dotenv";
import express from "express";

const router = express.Router();
dotEnv.config();

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || process.env.USER;
  const emailPass = process.env.EMAIL_PASS || process.env.APP_PASS;

  if (
    !emailUser ||
    !emailPass ||
    emailUser === "your_email@gmail.com" ||
    emailPass === "your_app_password"
  ) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    authMethod: "LOGIN",
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// POST route for form submission
router.post("/contact", async (req, res) => {
  const { email, subject, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: "Email and message are required" });
  }

  const transporter = createTransporter();
  if (!transporter) {
    return res.status(500).json({
      message:
        "Email service is not configured. Set USER and APP_PASS in backend/.env and restart the server.",
    });
  }

  try {
    // Send email using the transporter
    let info = await transporter.sendMail({
      from: {
        name: "Muhammad Umer",
        address: process.env.EMAIL_USER || process.env.USER,
      },
      to: process.env.CONTACT_TO || process.env.EMAIL_USER || process.env.USER,
      replyTo: email,
      subject: subject || "New contact request",
      text: `Email: ${email}\n\nMessage: ${message}`,
    });

    // Send response with email info and success message
    res.status(200).json({ info, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    const message =
      error && error.responseCode === 535
        ? "Invalid email credentials. Check EMAIL_USER and EMAIL_PASS in backend/.env. If using Gmail, create an App Password and enable 2FA."
        : "Failed to send email";
    res.status(500).json({ message });
  }
});

export default router;
