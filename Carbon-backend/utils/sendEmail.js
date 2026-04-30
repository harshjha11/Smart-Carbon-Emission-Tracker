const nodemailer = require("nodemailer");

const getTimeout = () => Number(process.env.EMAIL_TIMEOUT_MS) || 30000;
const getEmailUser = () => process.env.EMAIL_USER?.trim();
const getEmailPass = () => process.env.EMAIL_PASS?.replace(/\s+/g, "");
const getFromAddress = () =>
  process.env.EMAIL_FROM ||
  `"Carbon Tracker" <${getEmailUser() || "onboarding@resend.dev"}>`;

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

const createSmtpTransporter = ({ port, secure }) =>
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,
    secure,
    auth: {
      user: getEmailUser(),
      pass: getEmailPass(),
    },
    connectionTimeout: getTimeout(),
    greetingTimeout: getTimeout(),
    socketTimeout: getTimeout(),
  });

const sendWithSmtp = async (to, subject, text) => {
  if (!getEmailUser() || !getEmailPass()) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set");
  }

  const configs = [
    { port: 465, secure: true },
    { port: 587, secure: false },
  ];

  let lastError;

  for (const config of configs) {
    const transporter = createSmtpTransporter(config);

    try {
      const info = await transporter.sendMail({
        from: getFromAddress(),
        to,
        subject,
        text,
      });

      console.log(`Email sent via Gmail SMTP port ${config.port}:`, info.response);
      return info;
    } catch (error) {
      lastError = error;

      if (!["ETIMEDOUT", "ESOCKET", "ECONNECTION"].includes(error?.code)) {
        throw error;
      }

      console.warn(`Gmail SMTP port ${config.port} failed:`, error.message);
    }
  }

  throw lastError;
};

const sendEmail = async (to, subject, text) => {
  if (process.env.RESEND_API_KEY?.trim()) {
    return sendWithResend(to, subject, text);
  }

  return sendWithSmtp(to, subject, text);
};

module.exports = sendEmail;
