const express = require("express");
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");

const router = express.Router();

// Ruta exclusiva para administradores
router.get("/dashboard", auth, requireRole("admin"), (req, res) => {
  res.json({
    ok: true,
    message: "Acceso permitido solo para ADMIN 👑",
    usuario: req.user
  });
});

module.exports = router;