const express = require("express");
const auth = require("../../middlewares/auth");

const router = express.Router();

// Ruta protegida
router.get("/ping", auth, (req, res) => {
  res.json({
    ok: true,
    message: "Acceso autorizado a ruta protegida",
    usuario: req.user
  });
});

module.exports = router;