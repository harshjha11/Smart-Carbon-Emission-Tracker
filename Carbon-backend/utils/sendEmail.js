const nodemailer = require("nodemailer");

const getTimeout = () => Number(process.env.EMAIL_TIMEOUT_MS) || 15000;

const createTransporter = (port) =>
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

const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Carbon Tracker" <${process.env.EMAIL_USER.trim()}>`,
    to,
    subject,
    text,
  };

  const primaryPort = Number(process.env.EMAIL_PORT) || 465;
  const portsToTry = [...new Set([primaryPort, primaryPort === 465 ? 587 : 465])];
  let lastError;

  for (const port of portsToTry) {
    try {
      const transporter = createTransporter(port);
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent via port ${port}:`, info.response);
      return info;
    } catch (error) {
      lastError = error;
      console.error(`Email sending failed on port ${port}:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
    }
  }

  throw lastError;
};

module.exports = sendEmail;
