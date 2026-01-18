const Cliente = require("../../models/cliente.model");
const Cotizacion = require("../../models/cotizacion.model");
const Reserva = require("../../models/reserva.model");

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

async function getDashboardResumen() {
  const { start, end } = monthRange(new Date());

  const clientesActivos = await Cliente.countDocuments({ active: { $ne: false } });

  const cotizacionesPendientes = await Cotizacion.countDocuments({
    active: { $ne: false },
    estado: "pendiente",
  });

  const cotizacionesAprobadas = await Cotizacion.countDocuments({
    active: { $ne: false },
    estado: "aprobada",
  });

  const reservasActivas = await Reserva.countDocuments({ active: { $ne: false } });

// Ventas del mes: suma de monto de cotizaciones APROBADAS por fechaServicio (mes actual)
const ventasAgg = await Cotizacion.aggregate([
  {
    $match: {
      active: { $ne: false },
      estado: "aprobada",
      fechaServicio: { $gte: start, $lt: end },
    },
  },
  {
    $group: {
      _id: null,
      total: { $sum: "$total" },
    },
  },
]);

const ventasMes = ventasAgg?.[0]?.total || 0;


  const now = new Date();
  const next7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const cotPendientesProximas = await Cotizacion.countDocuments({
    active: { $ne: false },
    estado: "pendiente",
    fechaServicio: { $gte: now, $lte: next7 },
  });

  return {
    clientesActivos,
    cotizacionesPendientes,
    cotizacionesAprobadas,
    reservasActivas,
    ventasMes,
    cotPendientesProximas,
  };
}

module.exports = { getDashboardResumen };