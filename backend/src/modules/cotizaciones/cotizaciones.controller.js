const { validationResult } = require("express-validator");
const {
  createCotizacion,
  listCotizaciones,
  getCotizacionById,
  updateCotizacion,
  updateEstadoCotizacion,
  disableCotizacion,
} = require("./cotizaciones.service");

const { registrarAuditoria } = require("../auditoria/auditoria.service");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

async function createCotizacionController(req, res) {
  if (handleValidation(req, res)) return;

  try {
    const userId = req.userId;
    const cot = await createCotizacion(req.body, userId);

    // Auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: "Crear cotización",
      modulo: "Cotizaciones",
      detalle: `Creación de cotización ${cot?._id}`,
      metadata: { cotizacionId: cot?._id, payload: req.body },
    });

    res.status(201).json(cot);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function listCotizacionesController(req, res) {
  try {
    const list = await listCotizaciones();
    res.json(list);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function getCotizacionByIdController(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const cot = await getCotizacionById(req.params.id);
    res.json(cot);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function updateCotizacionController(req, res) {
  if (handleValidation(req, res)) return;

  try {
    const userId = req.userId;
    const cot = await updateCotizacion(req.params.id, req.body);

    // Auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: "Actualizar cotización",
      modulo: "Cotizaciones",
      detalle: `Actualización de cotización ${req.params.id}`,
      metadata: { cotizacionId: req.params.id, payload: req.body },
    });

    res.json(cot);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function updateEstadoCotizacionController(req, res) {
  if (handleValidation(req, res)) return;

  try {
    const userId = req.userId;
    const { estado } = req.body;

    const cot = await updateEstadoCotizacion(req.params.id, estado);

    // Auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: "Cambiar estado de cotización",
      modulo: "Cotizaciones",
      detalle: `Cambio de estado a "${estado}" en cotización ${req.params.id}`,
      metadata: { cotizacionId: req.params.id, nuevoEstado: estado },
    });

    res.json(cot);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function disableCotizacionController(req, res) {
  if (handleValidation(req, res)) return;

  try {
    const userId = req.userId;
    const cot = await disableCotizacion(req.params.id);

    // Auditoría
    await registrarAuditoria({
      usuarioId: userId,
      accion: "Eliminar cotización",
      modulo: "Cotizaciones",
      detalle: `Borrado lógico de cotización ${req.params.id}`,
      metadata: { cotizacionId: req.params.id },
    });

    res.json(cot);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

module.exports = {
  createCotizacionController,
  listCotizacionesController,
  getCotizacionByIdController,
  updateCotizacionController,
  updateEstadoCotizacionController,
  disableCotizacionController,
};
