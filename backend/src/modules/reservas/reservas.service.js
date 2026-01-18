const Reserva = require("../../models/reserva.model");
const Cotizacion = require("../../models/cotizacion.model");

function toSnapshotItems(items) {
  const normalized = (items || []).map((it) => {
    const cantidad = Math.max(1, Number(it.cantidad || 1));
    const precioUnitario = Math.max(0, Number(it.precioUnitario || 0));
    const subtotal = Math.max(0, Number(it.subtotal ?? cantidad * precioUnitario));

    return {
      servicioId: it.servicioId,
      nombreServicio: String(it.nombreServicio || "").trim(),
      cantidad,
      precioUnitario,
      subtotal,
    };
  });

  const total = normalized.reduce((acc, it) => acc + Number(it.subtotal || 0), 0);
  return { items: normalized, total };
}

async function createReserva(data, userId) {
  const cot = await Cotizacion.findById(data.cotizacionId).populate("clienteId");

  if (!cot || cot.active === false) {
    const err = new Error("Cotización no encontrada");
    err.statusCode = 404;
    throw err;
  }

  if (cot.estado !== "aprobada") {
    const err = new Error("Solo se puede crear una reserva desde una cotización aprobada");
    err.statusCode = 409;
    throw err;
  }

  // Evita doble reserva activa para la misma cotización
  const yaExiste = await Reserva.findOne({ cotizacionId: cot._id, active: true });
  if (yaExiste) {
    const err = new Error("Ya existe una reserva activa para esta cotización");
    err.statusCode = 409;
    throw err;
  }

  const { items, total } = toSnapshotItems(cot.items || []);

  const reserva = await Reserva.create({
    cotizacionId: cot._id,
    clienteId: typeof cot.clienteId === "object" ? cot.clienteId._id : cot.clienteId,

    fechaServicio: cot.fechaServicio,
    pasajeros: Number(cot.pasajeros || 1),
    origen: String(cot.origen || "").trim(),
    destino: String(cot.destino || "").trim(),

    items,
    total,

    estado: "confirmada",
    observaciones: String(data.observaciones || "").trim(),

    createdBy: userId,
    active: true,
  });

  return await Reserva.findById(reserva._id)
    .populate("clienteId", "nombre rut email telefono active")
    .populate("cotizacionId", "estado total fechaServicio pasajeros origen destino active");
}

async function listReservas() {
  return await Reserva.find({ active: true })
    .sort({ createdAt: -1 })
    .populate("clienteId", "nombre rut email telefono active")
    .populate("cotizacionId", "estado total fechaServicio pasajeros origen destino active");
}

async function getReservaById(id) {
  const r = await Reserva.findById(id)
    .populate("clienteId", "nombre rut email telefono active")
    .populate("cotizacionId", "estado total fechaServicio pasajeros origen destino active");

  if (!r) {
    const err = new Error("Reserva no encontrada");
    err.statusCode = 404;
    throw err;
  }
  return r;
}

async function updateReserva(id, data) {
  const r = await Reserva.findById(id);
  if (!r || r.active === false) {
    const err = new Error("Reserva no encontrada");
    err.statusCode = 404;
    throw err;
  }

  if (data.estado !== undefined) r.estado = data.estado;
  if (data.observaciones !== undefined) r.observaciones = String(data.observaciones || "").trim();

  await r.save();

  return await Reserva.findById(r._id)
    .populate("clienteId", "nombre rut email telefono active")
    .populate("cotizacionId", "estado total fechaServicio pasajeros origen destino active");
}

async function disableReserva(id) {
  const r = await Reserva.findByIdAndUpdate(id, { $set: { active: false } }, { new: true });

  if (!r) {
    const err = new Error("Reserva no encontrada");
    err.statusCode = 404;
    throw err;
  }
  return r;
}

module.exports = {
  createReserva,
  listReservas,
  getReservaById,
  updateReserva,
  disableReserva,
};