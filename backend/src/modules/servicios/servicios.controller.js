const { validationResult } = require("express-validator");
const {
  createServicio,
  listServicios,
  getServicioById,
  updateServicio,
  disableServicio,
} = require("./servicios.service");

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

async function createServicioController(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const servicio = await createServicio(req.body);
    res.status(201).json(servicio);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function listServiciosController(req, res) {
  try {
    const servicios = await listServicios();
    res.json(servicios);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function getServicioByIdController(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const servicio = await getServicioById(req.params.id);
    res.json(servicio);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function updateServicioController(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const servicio = await updateServicio(req.params.id, req.body);
    res.json(servicio);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

async function disableServicioController(req, res) {
  if (handleValidation(req, res)) return;
  try {
    const servicio = await disableServicio(req.params.id);
    res.json(servicio);
  } catch (e) {
    res.status(e.statusCode || 500).json({ message: e.message });
  }
}

module.exports = {
  createServicioController,
  listServiciosController,
  getServicioByIdController,
  updateServicioController,
  disableServicioController,
};