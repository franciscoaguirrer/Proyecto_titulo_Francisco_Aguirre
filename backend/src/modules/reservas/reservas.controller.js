const { validationResult } = require("express-validator");
const {
  createReserva,
  listReservas,
  getReservaById,
  updateReserva,
  disableReserva,
} = require("./reservas.service");

const { registrarAuditoria } = require("../auditoria/auditoria.service");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

async function createReservaController(req, res) {
  if (handleValidation(req, res)) return;

  try {
    const userId = req.userId;
    const r = await createReserva(req.body, userId);

    await registrarAuditoria({
      usuarioId: userId,
      accion: "Crear reserva",
      modulo: "Reservas",
      detalle: `Creación de reserva ${r?._id}`,
      metadata: { reservaId: r?._id, payload: req.body },
    });

    res.status(201).json(r);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function listReservasController(req, res) {
  try {
    const list = await listReservas();
    res.json(list);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function getReservaByIdController(req, res) {
  if (handleValidation(req, res)) return;

  try {
    const r = await getReservaById(req.params.id);
    res.json(r);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function updateReservaController(req, res) {
  if (handleValidation(req, res)) return;

  try {
    const userId = req.userId;
    const r = await updateReserva(req.params.id, req.body);

    await registrarAuditoria({
      usuarioId: userId,
      accion: "Actualizar reserva",
      modulo: "Reservas",
      detalle: `Actualización de reserva ${req.params.id}`,
      metadata: { reservaId: req.params.id, payload: req.body },
    });

    res.json(r);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function disableReservaController(req, res) {
  if (handleValidation(req, res)) return;

  try {
    const userId = req.userId;
    const r = await disableReserva(req.params.id);

    await registrarAuditoria({
      usuarioId: userId,
      accion: "Eliminar reserva",
      modulo: "Reservas",
      detalle: `Borrado lógico de reserva ${req.params.id}`,
      metadata: { reservaId: req.params.id },
    });

    res.json(r);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

module.exports = {
  createReservaController,
  listReservasController,
  getReservaByIdController,
  updateReservaController,
  disableReservaController,
};