const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const privateRoutes = require("./modules/private/private.routes");
const adminRoutes = require("./modules/private/admin.routes");
const usersRoutes = require("./modules/users/users.routes");
const clientesRoutes = require("./modules/clientes/clientes.routes");
const cotizacionesRoutes = require("./modules/cotizaciones/cotizaciones.routes");
const reservasRoutes = require("./modules/reservas/reservas.routes");
const auditoriaRoutes = require("./modules/auditoria/auditoria.routes");
const serviciosRoutes = require("./modules/servicios/servicios.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/privado", privateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/usuarios", usersRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/cotizaciones", cotizacionesRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/auditoria", auditoriaRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/dashboard", require("./modules/dashboard/dashboard.routes"));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Ruta de prueba
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Making Trips API funcionando correctamente 🚐"
  });
});

module.exports = app;