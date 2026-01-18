const express = require("express");
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");
const { listarAuditoriaController } = require("./auditoria.controller");

const router = express.Router();

router.use(auth);
router.use(requireRole("admin"));

router.get("/", listarAuditoriaController);

module.exports = router;