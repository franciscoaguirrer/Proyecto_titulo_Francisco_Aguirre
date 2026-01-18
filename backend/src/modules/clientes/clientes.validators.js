const { body, param } = require("express-validator");

const createClienteValidator = [
  body("nombre").notEmpty().withMessage("Nombre es obligatorio"),
  body("rut").notEmpty().withMessage("RUT es obligatorio"),
  body("email").isEmail().withMessage("Email inválido"),
  body("telefono").notEmpty().withMessage("Teléfono es obligatorio"),
  body("direccion").optional().isString()
];

const updateClienteValidator = [
  param("id").isMongoId().withMessage("ID inválido"),
  body("nombre").optional().isString(),
  body("rut").optional().isString(),
  body("email").optional().isEmail().withMessage("Email inválido"),
  body("telefono").optional().isString(),
  body("direccion").optional().isString(),
  body("active").optional().isBoolean()
];

const idParamValidator = [
  param("id").isMongoId().withMessage("ID inválido"),
];

module.exports = {
  createClienteValidator,
  updateClienteValidator,
  idParamValidator,
};