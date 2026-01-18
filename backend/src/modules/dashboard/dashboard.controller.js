const { getDashboardResumen } = require("./dashboard.service.js");

async function getDashboardResumenController(req, res) {
  try {
    const data = await getDashboardResumen();
    return res.json(data);
  } catch (e) {
    console.error("Dashboard resumen error:", e);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = { getDashboardResumenController };