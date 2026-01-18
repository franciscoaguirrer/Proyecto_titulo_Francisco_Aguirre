const router = require("express").Router();
const {
  loginController,
  forgotPasswordController,
  resetPasswordController
} = require("./auth.controller");
router.get("/_debug", (req, res) => {
  res.json({ ok: true, router: "auth.routes.js cargado" });
});
router.post("/login", loginController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

module.exports = router
;