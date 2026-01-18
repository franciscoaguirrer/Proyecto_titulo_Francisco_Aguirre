const Cotizacion = require("../../models/cotizacion.model");
const Cliente = require("../../models/cliente.model");
const Servicio = require("../../models/servicio.model");

function calcTotals(items) {
  const normalized = (items || []).map((it) => {
    const cantidad = Number(it.cantidad ?? 1);
    const precioUnitario = Number(it.precioUnitario ?? 0);
    const subtotal = Math.max(0, cantidad * precioUnitario);
    return {
      servicioId: it.servicioId,
      nombreServicio: (it.nombreServicio || "").trim(),
      cantidad,
      precioUnitario,
      subtotal,
    };
  });

  const total = normalized.reduce((acc, it) => acc + Number(it.subtotal || 0), 0);
  return { items: normalized, total };
}

async function hydrateItemNames(items) {
  const ids = [...new Set(items.map((x) => String(x.servicioId)))];
  const servicios = await Servicio.find({ _id: { $in: ids } }).select("_id nombre active");

  const map = new Map(servicios.map((s) => [String(s._id), s]));

  for (const it of items) {
    const s = map.get(String(it.servicioId));
    if (!s) {
      const err = new Error("Servicio no encontrado");
      err.statusCode = 404;
      throw err;
    }
    if (s.active === false) {
      const err = new Error("No se puede cotizar un servicio inactivo");
      err.statusCode = 409;
      throw err;
    }
    if (!it.nombreServicio) it.nombreServicio = s.nombre;
  }
  return items;
}

async function createCotizacion(data, userId) {
  const cliente = await Cliente.findById(data.clienteId);
  if (!cliente || cliente.active === false) {
    const err = new Error("Cliente no encontrado o inactivo");
    err.statusCode = 404;
    throw err;
  }

  if (!Array.isArray(data.items) || data.items.length < 1) {
    const err = new Error("Debe incluir al menos un servicio");
    err.statusCode = 400;
    throw err;
  }

  let items = data.items.map((it) => ({
    servicioId: it.servicioId,
    cantidad: it.cantidad ?? 1,
    precioUnitario: it.precioUnitario,
    nombreServicio: it.nombreServicio || "",
  }));

  items = await hydrateItemNames(items);
  const { items: withTotals, total } = calcTotals(items);

  return await Cotizacion.create({
    clienteId: data.clienteId,
    origen: String(data.origen || "").trim(),
    destino: String(data.destino || "").trim(),
    fechaServicio: new Date(data.fechaServicio),
    pasajeros: Number(data.pasajeros),

    items: withTotals,
    total,

    estado: "pendiente",
    observaciones: String(data.observaciones || "").trim(),

    createdBy: userId,
    active: true,
  });
}

async function listCotizaciones() {
  return await Cotizacion.find({ active: true })
    .sort({ createdAt: -1 })
    .populate("clienteId", "nombre rut email telefono active");
}

async function getCotizacionById(id) {
  const cot = await Cotizacion.findById(id)
    .populate("clienteId", "nombre rut email telefono active");

  if (!cot) {
    const err = new Error("Cotización no encontrada");
    err.statusCode = 404;
    throw err;
  }
  return cot;
}

async function updateCotizacion(id, data) {
  const cot = await Cotizacion.findById(id);
  if (!cot || cot.active === false) {
    const err = new Error("Cotización no encontrada");
    err.statusCode = 404;
    throw err;
  }

  if (data.clienteId) {
    const cliente = await Cliente.findById(data.clienteId);
    if (!cliente || cliente.active === false) {
      const err = new Error("Cliente no encontrado o inactivo");
      err.statusCode = 404;
      throw err;
    }
    cot.clienteId = data.clienteId;
  }

  if (data.origen !== undefined) cot.origen = String(data.origen || "").trim();
  if (data.destino !== undefined) cot.destino = String(data.destino || "").trim();
  if (data.fechaServicio !== undefined) cot.fechaServicio = new Date(data.fechaServicio);
  if (data.pasajeros !== undefined) cot.pasajeros = Number(data.pasajeros);

  if (data.items) {
    let items = data.items.map((it) => ({
      servicioId: it.servicioId,
      cantidad: it.cantidad ?? 1,
      precioUnitario: it.precioUnitario,
      nombreServicio: it.nombreServicio || "",
    }));

    items = await hydrateItemNames(items);
    const { items: withTotals, total } = calcTotals(items);

    cot.items = withTotals;
    cot.total = total;
  }

  if (data.observaciones !== undefined) {
    cot.observaciones = String(data.observaciones || "").trim();
  }

  await cot.save();
  return await Cotizacion.findById(cot._id).populate("clienteId", "nombre rut email telefono active");
}

async function updateEstadoCotizacion(id, estado) {
  const cot = await Cotizacion.findById(id);
  if (!cot || cot.active === false) {
    const err = new Error("Cotización no encontrada");
    err.statusCode = 404;
    throw err;
  }

  cot.estado = estado;
  await cot.save();

  return await Cotizacion.findById(cot._id).populate("clienteId", "nombre rut email telefono active");
}

async function disableCotizacion(id) {
  const cot = await Cotizacion.findByIdAndUpdate(
    id,
    { $set: { active: false } },
    { new: true }
  );

  if (!cot) {
    const err = new Error("Cotización no encontrada");
    err.statusCode = 404;
    throw err;
  }
  return cot;
}

module.exports = {
  createCotizacion,
  listCotizaciones,
  getCotizacionById,
  updateCotizacion,
  updateEstadoCotizacion,
  disableCotizacion,
};
