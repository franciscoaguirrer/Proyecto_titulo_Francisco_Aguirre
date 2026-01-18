const express = require("express");
const auth = require("../../middlewares/auth");
const requireRole = require("../../middlewares/requireRole");

const {
  createReservaController,
  listReservasController,
  getReservaByIdController,
  updateReservaController,
  disableReservaController,
} = require("./reservas.controller");

const {
  createReservaValidator,
  updateReservaValidator,
  idParamValidator,
} = require("./reservas.validators");

const router = express.Router();

router.use(auth);

router.post("/", createReservaValidator, createReservaController);
router.get("/", listReservasController);
router.get("/:id", idParamValidator, getReservaByIdController);
router.patch("/:id", idParamValidator, updateReservaValidator, updateReservaController);
router.delete("/:id", requireRole("admin"), idParamValidator, disableReservaController);

module.exports = router;