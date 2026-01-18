const { body, param } = require("express-validator");

const createUserValidator = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password debe tener al menos 6 caracteres"),
  body("role")
    .optional()
    .isIn(["admin", "operador"])
    .withMessage("Role inválido"),
];

const updateUserValidator = [
  param("id").isMongoId().withMessage("ID inválido"),
  body("role")
    .optional()
    .isIn(["admin", "operador"])
    .withMessage("Role inválido"),
  body("active")
    .optional()
    .isBoolean()
    .withMessage("Active debe ser boolean"),
];

const idParamValidator = [
  param("id").isMongoId().withMessage("ID inválido"),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  idParamValidator,
};