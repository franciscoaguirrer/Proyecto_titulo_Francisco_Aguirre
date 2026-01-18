const { body, param } = require("express-validator");

const idParamValidator = [
  param("id").isMongoId().withMessage("ID inválido"),
];

const createReservaValidator = [
  body("cotizacionId")
    .notEmpty()
    .withMessage("cotizacionId es obligatorio")
    .bail()
    .isMongoId()
    .withMessage("cotizacionId inválido"),

  body("observaciones")
    .optional()
    .isString()
    .withMessage("observaciones debe ser texto"),
];

const updateReservaValidator = [
  body("estado")
    .optional()
    .isIn(["confirmada", "cancelada", "finalizada"])
    .withMessage("estado inválido"),

  body("observaciones")
    .optional()
    .isString()
    .withMessage("observaciones debe ser texto"),
];

module.exports = {
  idParamValidator,
  createReservaValidator,
  updateReservaValidator,
};