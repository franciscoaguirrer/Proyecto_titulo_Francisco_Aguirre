const { listarAuditoria } = require("./auditoria.service");

async function listarAuditoriaController(req, res) {
  try {
    const logs = await listarAuditoria();
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener auditoría" });
  }
}

module.exports = {
  listarAuditoriaController
};