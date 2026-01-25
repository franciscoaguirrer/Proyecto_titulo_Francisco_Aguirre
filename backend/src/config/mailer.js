const nodemailer = require("nodemailer");

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,

    logger: true,
    debug: true,
  });
}

async function sendMail({ to, subject, html }) {
  const transporter = createTransport();

  try {
    await transporter.verify();
    console.log("✅ SMTP verify OK");
  } catch (e) {
    console.error("❌ SMTP verify FAIL:", e);
    throw e;
  }

  const from = (process.env.MAIL_FROM || process.env.SMTP_USER || "").trim();

  try {
    console.log("📨 Enviando correo a:", to);
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log("✅ Correo enviado:", info?.messageId || info);
    return info;
  } catch (e) {
    console.error("❌ Error sendMail:", e);
    throw e;
  }
}

module.exports = { sendMail };