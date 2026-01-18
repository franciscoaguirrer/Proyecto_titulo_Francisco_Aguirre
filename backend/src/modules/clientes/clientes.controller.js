const { validationResult } = require("express-validator");
const {
  createCliente,
  listClientes,
  getClienteById,
  updateCliente,
  disableCliente,
  getClienteByRut,
} = require("./clientes.service");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

async function createClienteController(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const cliente = await createCliente(req.body);
    res.status(201).json(cliente);
  } catch (e) {
    res.status(e.statusCode || 500).json({
      message: e.message,
      code: e.code,
      clienteId: e.clienteId,
    });
  }
}

async function listClientesController(req, res) {
  try {
    const clientes = await listClientes();
    res.json(clientes);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function getClienteByRutController(req, res) {
  try {
    const rut = (req.params.rut || "").trim();
    if (!rut) return res.status(400).json({ message: "RUT es requerido" });

    const cliente = await getClienteByRut(rut);
    return res.json(cliente);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function getClienteByIdController(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const cliente = await getClienteById(req.params.id);
    res.json(cliente);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function updateClienteController(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const cliente = await updateCliente(req.params.id, req.body);
    res.json(cliente);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function disableClienteController(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const cliente = await disableCliente(req.params.id);
    res.json(cliente);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

module.exports = {
  createClienteController,
  listClientesController,
  getClienteByRutController,
  getClienteByIdController,
  updateClienteController,
  disableClienteController,
};