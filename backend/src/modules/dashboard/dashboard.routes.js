const express = require("express");
const auth = require("../../middlewares/auth");

const { getDashboardResumenController } = require("./dashboard.controller");

const router = express.Router();

router.use(auth);
router.get("/resumen", getDashboardResumenController);

module.exports = router;