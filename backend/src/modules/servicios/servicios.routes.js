const express = require("express");
const auth = require("../../middlewares/auth");

const {
  createServicioController,
  listServiciosController,
  getServicioByIdController,
  updateServicioController,
  disableServicioController,
} = require("./servicios.controller");

const {
  createServicioValidator,
  updateServicioValidator,
  idParamValidator,
} = require("./servicios.validators");

const router = express.Router();

// Servicios: requiere estar logueado (admin u operador)
router.use(auth);

router.post("/", createServicioValidator, createServicioController);
router.get("/", listServiciosController);
router.get("/:id", idParamValidator, getServicioByIdController);
router.patch("/:id", idParamValidator, updateServicioValidator, updateServicioController);
router.delete("/:id", idParamValidator, disableServicioController);

module.exports = router;