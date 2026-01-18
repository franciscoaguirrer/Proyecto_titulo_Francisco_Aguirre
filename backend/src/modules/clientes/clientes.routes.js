const express = require("express");
const auth = require("../../middlewares/auth");

const {
  createClienteController,
  listClientesController,
  getClienteByRutController,
  getClienteByIdController,
  updateClienteController,
  disableClienteController,
} = require("./clientes.controller");

const {
  createClienteValidator,
  updateClienteValidator,
  idParamValidator,
} = require("./clientes.validators");

const router = express.Router();

// Clientes: requiere estar logueado (admin u operador)
router.use(auth);

router.post("/", createClienteValidator, createClienteController);
router.get("/", listClientesController);
router.get("/by-rut/:rut", getClienteByRutController);
router.get("/:id", idParamValidator, getClienteByIdController);
router.patch("/:id", updateClienteValidator, updateClienteController);
router.delete("/:id", idParamValidator, disableClienteController);

module.exports = router;