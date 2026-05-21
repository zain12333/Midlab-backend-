import nodemailer from "nodemailer";
import dotEnv from "dotenv";
import express from "express";

const router = express.Router();
dotEnv.config();

const createTransporter = () => {
  const emailUser = process.env.USER;
  const emailPass = process.env.APP_PASS;

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
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: emailUser,
      pass: emailPass,
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
        address: process.env.USER,
      },
      to: process.env.CONTACT_TO || process.env.USER,
      replyTo: email,
      subject: subject || "New contact request",
      text: `Email: ${email}\n\nMessage: ${message}`,
    });

    // Send response with email info and success message
    res.status(200).json({ info, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

export default router;
