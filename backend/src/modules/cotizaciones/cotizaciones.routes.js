const express = require("express");
const auth = require("../../middlewares/auth");

const {
  createCotizacionController,
  listCotizacionesController,
  getCotizacionByIdController,
  updateCotizacionController,
  updateEstadoCotizacionController,
  disableCotizacionController,
} = require("./cotizaciones.controller");

const {
  idParamValidator,
  createCotizacionValidator,
  updateCotizacionValidator,
  updateEstadoValidator,
} = require("./cotizaciones.validators");

const router = express.Router();

router.use(auth);

router.post("/", createCotizacionValidator, createCotizacionController);
router.get("/", listCotizacionesController);
router.get("/:id", idParamValidator, getCotizacionByIdController);
router.patch("/:id", idParamValidator, updateCotizacionValidator, updateCotizacionController);
router.patch("/:id/estado", idParamValidator, updateEstadoValidator, updateEstadoCotizacionController);
router.delete("/:id", idParamValidator, disableCotizacionController);

module.exports = router;