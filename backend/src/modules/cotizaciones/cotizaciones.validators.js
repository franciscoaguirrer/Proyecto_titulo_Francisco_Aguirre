const { body, param } = require("express-validator");

const idParamValidator = [param("id").isMongoId().withMessage("ID inválido")];

const createCotizacionValidator = [
  body("clienteId").isMongoId().withMessage("clienteId inválido"),

  body("origen").notEmpty().withMessage("origen es obligatorio").isString().trim(),
  body("destino").notEmpty().withMessage("destino es obligatorio").isString().trim(),
  body("fechaServicio").notEmpty().withMessage("fechaServicio es obligatoria").isISO8601().withMessage("fechaServicio inválida"),
  body("pasajeros").notEmpty().withMessage("pasajeros es obligatorio").isInt({ min: 1 }).withMessage("pasajeros debe ser >= 1"),

  body("items").isArray({ min: 1 }).withMessage("Debe enviar al menos 1 servicio en items"),
  body("items.*.servicioId").isMongoId().withMessage("items[].servicioId inválido"),
  body("items.*.cantidad").optional().isInt({ min: 1 }).withMessage("items[].cantidad debe ser >= 1"),
  body("items.*.precioUnitario").notEmpty().withMessage("items[].precioUnitario es obligatorio").isFloat({ min: 0 }).withMessage("items[].precioUnitario debe ser >= 0"),

  body("observaciones").optional().isString().trim(),
];

const updateCotizacionValidator = [
  body("clienteId").optional().isMongoId().withMessage("clienteId inválido"),

  body("origen").optional().isString().trim(),
  body("destino").optional().isString().trim(),
  body("fechaServicio").optional().isISO8601().withMessage("fechaServicio inválida"),
  body("pasajeros").optional().isInt({ min: 1 }).withMessage("pasajeros debe ser >= 1"),

  body("items").optional().isArray({ min: 1 }).withMessage("items debe tener al menos 1 elemento"),
  body("items.*.servicioId").optional().isMongoId().withMessage("items[].servicioId inválido"),
  body("items.*.cantidad").optional().isInt({ min: 1 }).withMessage("items[].cantidad debe ser >= 1"),
  body("items.*.precioUnitario").optional().isFloat({ min: 0 }).withMessage("items[].precioUnitario debe ser >= 0"),

  body("observaciones").optional().isString().trim(),
];

const updateEstadoValidator = [
  body("estado").isIn(["pendiente", "aprobada", "rechazada"]).withMessage("Estado inválido"),
];

module.exports = {
  idParamValidator,
  createCotizacionValidator,
  updateCotizacionValidator,
  updateEstadoValidator,
};