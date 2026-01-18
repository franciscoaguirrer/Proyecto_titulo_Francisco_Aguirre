const Cliente = require("../../models/cliente.model");

async function createCliente(data) {
  const rut = (data.rut || "").trim();

  // Si hay RUT, buscamos si existe (activo o inactivo)
  if (rut) {
    const exists = await Cliente.findOne({ rut });

    if (exists) {
      if (exists.active === false) {
        const err = new Error("Cliente existe pero está inactivo. Puede reactivarse.");
        err.statusCode = 409;
        err.code = "CLIENTE_INACTIVO";
        err.clienteId = exists._id.toString();
        throw err;
      }

      // si está activo -> duplicado normal
      const err = new Error("Ya existe un cliente con ese RUT");
      err.statusCode = 409;
      err.code = "RUT_DUPLICADO";
      throw err;
    }
  }

  // crear normal
  return await Cliente.create({
    ...data,
    rut,
    active: true,
  });
}

async function listClientes() {
  // solo activos
  return await Cliente.find({ active: { $ne: false } }).sort({ createdAt: -1 });
}

async function getClienteByRut(rut) {
  const rutClean = (rut || "").trim();
  if (!rutClean) return null;

  // incluye inactivos
  return await Cliente.findOne({ rut: rutClean });
}

async function getClienteById(id) {
  const cliente = await Cliente.findById(id);
  if (!cliente) {
    const err = new Error("Cliente no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return cliente;
}

async function updateCliente(id, data) {
  const payload = { ...data };
  if (payload.rut) payload.rut = String(payload.rut).trim();

  const cliente = await Cliente.findByIdAndUpdate(id, { $set: payload }, { new: true });
  if (!cliente) {
    const err = new Error("Cliente no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return cliente;
}

async function disableCliente(id) {
  const cliente = await Cliente.findByIdAndUpdate(
    id,
    { $set: { active: false } },
    { new: true }
  );
  if (!cliente) {
    const err = new Error("Cliente no encontrado");
    err.statusCode = 404;
    throw err;
  }
  return cliente;
}

module.exports = {
  createCliente,
  listClientes,
  getClienteByRut,
  getClienteById,
  updateCliente,
  disableCliente,
};