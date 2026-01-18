const { forgotPassword, resetPassword, login } = require("./auth.service");

async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    return res.json(result);
  } catch (e) {
    return res.status(401).json({ message: e.message });
  }
}

async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body;
    const result = await forgotPassword(email);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function resetPasswordController(req, res) {
  try {
    const { email, token, newPassword } = req.body;
    const result = await resetPassword(email, token, newPassword);
    return res.json(result);
  } catch (e) {
    return res.status(e.statusCode || 500).json({ message: e.message });
  }
}

module.exports = {
  loginController,
  forgotPasswordController,
  resetPasswordController
};