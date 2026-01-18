const { body, param } = require("express-validator");

const createServicioValidator = [
  body("nombre")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio"),
  body("descripcion").optional().isString().trim(),
  body("precioBase")
    .notEmpty()
    .withMessage("El precioBase es obligatorio")
    .isFloat({ min: 0 })
    .withMessage("El precioBase debe ser un número mayor o igual a 0"),
];

const updateServicioValidator = [
  body("nombre").optional().isString().trim().notEmpty(),
  body("descripcion").optional().isString().trim(),
  body("precioBase").optional().isFloat({ min: 0 }),
  body("active").optional().isBoolean(),
];

const idParamValidator = [
  param("id").isMongoId().withMessage("ID inválido"),
];

module.exports = {
  createServicioValidator,
  updateServicioValidator,
  idParamValidator,
};