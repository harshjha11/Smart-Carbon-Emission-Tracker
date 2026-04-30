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

const createSmtpTransporter = (port) =>
  nodemailer.createTransport({
    host: (process.env.EMAIL_HOST || "smtp.gmail.com").trim(),
    port,
    secure: port === 465,
    requireTLS: port === 587,
    connectionTimeout: getTimeout(),
    greetingTimeout: getTimeout(),
    socketTimeout: getTimeout(),
    auth: {
      user: process.env.EMAIL_USER.trim(),
      pass: process.env.EMAIL_PASS.replace(/\s/g, ""),
    },
  });

const sendWithSmtp = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set");
  }

  const mailOptions = {
    from: getFromAddress(),
    to,
    subject,
    text,
  };

  const primaryPort = Number(process.env.EMAIL_PORT) || 465;
  const portsToTry = [
    ...new Set([primaryPort, primaryPort === 465 ? 587 : 465]),
  ];
  let lastError;

  for (const port of portsToTry) {
    try {
      const transporter = createSmtpTransporter(port);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent via SMTP port ${port}:`, info.response);
      return info;
    } catch (error) {
      lastError = error;
      console.error(`Email sending failed on SMTP port ${port}:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
    }
  }

  throw lastError;
};

const sendEmail = async (to, subject, text) => {
  if (!process.env.RESEND_API_KEY?.trim()) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return sendWithResend(to, subject, text);
};
module.exports = sendEmail;
