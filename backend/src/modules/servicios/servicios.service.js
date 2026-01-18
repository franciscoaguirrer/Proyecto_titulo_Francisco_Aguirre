const Servicio = require("../../models/servicio.model");

async function createServicio(data) {
  const nombre = (data.nombre || "").trim();

  // Evita duplicado por nombre (solo activos)
  const exists = await Servicio.findOne({ nombre, active: true });
  if (exists) {
    const err = new Error("Ya existe un servicio activo con ese nombre");
    err.statusCode = 409;
    throw err;
  }

  const payload = {
    nombre,
    descripcion: (data.descripcion || "").trim(),
    precioBase: Number(data.precioBase),
    active: true,
  };

  return await Servicio.create(payload);
}

async function listServicios() {
  // Solo activos
  return await Servicio.find({ active: true }).sort({ createdAt: -1 });
}

async function getServicioById(id) {
  const servicio = await Servicio.findById(id);
  if (!servicio) {
    const err = new Error("Servicio no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return servicio;
}

async function updateServicio(id, data) {
  if (data.nombre) {
    const nombre = String(data.nombre).trim();
    const exists = await Servicio.findOne({
      _id: { $ne: id },
      nombre,
      active: true,
    });

    if (exists) {
      const err = new Error("Ya existe un servicio activo con ese nombre");
      err.statusCode = 409;
      throw err;
    }
    data.nombre = nombre;
  }

  if (data.descripcion !== undefined) {
    data.descripcion = String(data.descripcion || "").trim();
  }

  if (data.precioBase !== undefined) {
    data.precioBase = Number(data.precioBase);
  }

  const servicio = await Servicio.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  );

  if (!servicio) {
    const err = new Error("Servicio no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return servicio;
}

async function disableServicio(id) {
  const servicio = await Servicio.findByIdAndUpdate(
    id,
    { $set: { active: false } },
    { new: true }
  );
  if (!servicio) {
    const err = new Error("Servicio no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return servicio;
}

module.exports = {
  createServicio,
  listServicios,
  getServicioById,
  updateServicio,
  disableServicio,
};