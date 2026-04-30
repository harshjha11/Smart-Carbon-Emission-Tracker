const nodemailer = require("nodemailer");

const getTimeout = () => Number(process.env.EMAIL_TIMEOUT_MS) || 15000;
const getFromAddress = () =>
  process.env.EMAIL_FROM ||
  `"Carbon Tracker" <${process.env.EMAIL_USER?.trim() || "onboarding@resend.dev"}>`;

const sendWithResend = async (to, subject, text) => {
  if (!process.env.EMAIL_FROM?.trim()) {
    const error = new Error(
      "EMAIL_FROM must be set to an address on your verified Resend domain.",
    );
    error.code = "ERESEND_CONFIG";
    throw error;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to,
      subject,
      text,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || "Resend email request failed");
    error.code = "ERESEND";
    error.response = JSON.stringify(data);
    throw error;
  }

  console.log("Email sent via Resend:", data.id || "accepted");
  return data;
};

const createSmtpTransporter = () =>
  nodemailer.createTransport({
    service: "gmail", // IMPORTANT CHANGE
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // App password
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });

const sendWithSmtp = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set");
  }

  const transporter = createSmtpTransporter();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });

  console.log("Email sent via Gmail:", info.response);
  return info;
};

const sendEmail = async (to, subject, text) => {
  if (!process.env.RESEND_API_KEY?.trim()) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return sendWithResend(to, subject, text);
};

module.exports = sendEmail;
