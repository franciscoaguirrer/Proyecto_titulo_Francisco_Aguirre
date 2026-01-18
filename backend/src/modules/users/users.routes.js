const express = require("express");
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");

const {
  createUserController,
  listUsersController,
  updateUserController,
  disableUserController,
} = require("./users.controller");

const {
  createUserValidator,
  updateUserValidator,
  idParamValidator,
} = require("./users.validators");

const router = express.Router();

// Módulo para ADMIN
router.use(auth, requireRole("admin"));

router.post("/", createUserValidator, createUserController);
router.get("/", listUsersController);
router.patch("/:id", updateUserValidator, updateUserController);
router.delete("/:id", idParamValidator, disableUserController);

module.exports = router;