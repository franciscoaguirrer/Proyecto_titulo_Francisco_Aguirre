const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/user.model");
const { sendMail } = require("../../config/mailer");

function isMailEnabled() {
  return String(process.env.MAIL_ENABLED).toLowerCase() === "true";
}

async function login(email, password) {
  const user = await User.findOne({ email });

  if (!user || !user.active) {
    throw new Error("Credenciales incorrectas");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new Error("Credenciales incorrectas");
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user: { id: user._id, email: user.email, role: user.role } };
}

/* Envía correo de recuperación (o lo simula en modo pruebas).
 * Importante: por seguridad, siempre responde OK aunque el correo no exista.
 */
async function forgotPassword(email) {
  console.log("🟢 forgotPassword EJECUTADO con email:", email);

  const genericMsg = { message: "Si el correo existe, enviaremos instrucciones." };

  const user = await User.findOne({ email });

  // Respuesta genérica para no revelar si el correo existe o no
  if (!user || !user.active) {
    return genericMsg;
  }

  // Token aleatorio para recuperación
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  await user.save();

  // Link hacia frontend
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const link = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  // MODO PRUEBAS: NO envía correo
  if (!isMailEnabled()) {
    console.log("🔐 TOKEN RECUPERACIÓN (DEV):", token);
    console.log("🔗 LINK RECUPERACIÓN (DEV):", link);
    return genericMsg; // importante: 200 OK desde el controller
  }

  // MODO REAL: enviar correo (si MAIL_ENABLED=true)
  await sendMail({
    to: user.email,
    subject: "Recuperación de contraseña - Making Trips",
    html: `
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace (válido por 1 hora):</p>
      <p><a href="${link}">${link}</a></p>
      <p>Si tú no solicitaste esto, puedes ignorar este correo.</p>
    `,
  });

  return genericMsg;
}

async function resetPassword(email, token, newPassword) {
  const user = await User.findOne({ email });
  if (!user || !user.active) {
    const err = new Error("Token inválido o expirado");
    err.statusCode = 400;
    throw err;
  }

  if (!user.resetPasswordTokenHash || !user.resetPasswordExpiresAt) {
    const err = new Error("Token inválido o expirado");
    err.statusCode = 400;
    throw err;
  }

  if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
    const err = new Error("Token inválido o expirado");
    err.statusCode = 400;
    throw err;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  if (tokenHash !== user.resetPasswordTokenHash) {
    const err = new Error("Token inválido o expirado");
    err.statusCode = 400;
    throw err;
  }

  if (!newPassword || newPassword.length < 6) {
    const err = new Error("La contraseña debe tener al menos 6 caracteres");
    err.statusCode = 400;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  return { message: "Contraseña actualizada correctamente" };
}

module.exports = { login, forgotPassword, resetPassword };