const Auditoria = require("../../models/auditoria.model");

async function registrarAuditoria({ usuarioId, accion, modulo, detalle, metadata }) {
  if (!usuarioId) {
    console.error("Auditoría NO registrada: falta usuarioId", { accion, modulo, detalle });
    return;
  }

  try {
    await Auditoria.create({
      usuarioId,
      accion,
      modulo,
      detalle,
      metadata,
    });
  } catch (error) {
    console.error("Error registrando auditoría:", error.message);
  }
}

async function listarAuditoria() {
  return await Auditoria.find()
    .populate("usuarioId", "email role")
    .sort({ createdAt: -1 });
}

module.exports = {
  registrarAuditoria,
  listarAuditoria,
};