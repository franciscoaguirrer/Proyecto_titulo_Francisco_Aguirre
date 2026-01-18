import { useEffect, useState } from "react";
import QuickNav from "../components/QuickNav";
import { useAuth } from "../auth/useAuth";
import logo from "../assets/logo.png";

import clientes from "/src/assets/clientes.png";
import servicios from "/src/assets/servicios.png";
import cotizaciones from "/src/assets/cotizaciones.jpg";
import reservas from "/src/assets/reservas.png";

import { getDashboardResumenApi, type DashboardResumen } from "../api/dashboard.api";

import "/src/styles/Dashboard.css";

function moneyCLP(n: number) {
  try {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);
  } catch {
    return `$${n}`;
  }
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const rol = (user as any)?.rol || user?.role;
  const [stats, setStats] = useState<DashboardResumen | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsErr, setStatsErr] = useState("");

  async function loadStats() {
    setStatsErr("");
    setLoadingStats(true);
    try {
      const data = await getDashboardResumenApi();
      setStats(data);
    } catch (e: any) {
      setStatsErr(e?.response?.data?.message || e?.message || "Error al cargar resumen del dashboard");
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="page">
      <QuickNav />

      {/* HEADER DASHBOARD */}
      <section className="dashboardHeader">
        <div className="dashboardHeaderLeft">
          <img src={logo} alt="Making Trips" className="dashboardLogo" />
          <div>
            <h1>SISTEMA WEB DE GESTIÓN</h1>
            <p>
              Bienvenido/a <b>{user?.email}</b> — Rol: <b>{rol}</b>
            </p>
          </div>
        </div>

        <button className="btn danger small" onClick={logout}>
          Salir
        </button>
      </section>

      <section className="dashKpiWrap">
        <div className="dashKpiHeader">
          <h2 className="dashKpiTitle">Resumen del sistema</h2>
          <button className="btn" type="button" onClick={loadStats} disabled={loadingStats}>
            {loadingStats ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {statsErr && <div className="error">{statsErr}</div>}

        {loadingStats && !stats ? (
          <p className="muted">Cargando resumen...</p>
        ) : stats ? (
          <div className="dashKpiGrid">
            <div className="dashKpiCard">
              <div className="dashKpiLabel">Reservas activas</div>
              <div className="dashKpiValue">{stats.reservasActivas}</div>
              <div className="dashKpiHint muted">Registros activos</div>
            </div>

            <div className="dashKpiCard">
              <div className="dashKpiLabel">Cotizaciones pendientes</div>
              <div className="dashKpiValue">{stats.cotizacionesPendientes}</div>
              <div className="dashKpiHint muted">
                Próx. 7 días: {stats.cotPendientesProximas ?? 0}
              </div>
            </div>

            <div className="dashKpiCard">
              <div className="dashKpiLabel">Cotizaciones aprobadas</div>
              <div className="dashKpiValue">{stats.cotizacionesAprobadas}</div>
              <div className="dashKpiHint muted">Listas para reserva</div>
            </div>

            <div className="dashKpiCard">
              <div className="dashKpiLabel">Ventas del mes</div>
              <div className="dashKpiValue">{moneyCLP(stats.ventasMes)}</div>
              <div className="dashKpiHint muted">Suma aprobadas</div>
            </div>

            <div className="dashKpiCard">
              <div className="dashKpiLabel">Clientes activos</div>
              <div className="dashKpiValue">{stats.clientesActivos}</div>
              <div className="dashKpiHint muted">Clientes habilitados</div>
            </div>
          </div>
        ) : (
          <p className="muted">No hay datos de resumen.</p>
        )}
      </section>

      <section className="dashboardCards">
        <div className="dashCard">
          <h3>Clientes</h3>
          <h4>Gestión de clientes.</h4>
          <p>
            Aquí se añaden nuevos clientes, se editan clientes existentes, se eliminan de forma lógica o se reactivan
            aquellos que fueron deshabilitados previamente.
          </p>
          <img src={clientes} alt="Clientes" className="dashboardIcon" />
        </div>

        <div className="dashCard">
          <h3>Servicios</h3>
          <h4>Gestión de servicios de transporte y turismo.</h4>
          <p>
            Permite registrar, modificar y desactivar los servicios ofrecidos por la empresa, definiendo precios base y
            descripciones que luego serán utilizados en cotizaciones y reservas.
          </p>
          <img src={servicios} alt="servicios" className="dashboardIcon" />
        </div>

        <div className="dashCard">
          <h3>Cotizaciones</h3>
          <h4>Presupuestos y estados de servicios.</h4>
          <p>
            Permite generar cotizaciones personalizadas para los clientes, incluyendo uno o varios servicios con precios
            editables, fechas, cantidad de pasajeros y control de estado (pendiente, aprobada o rechazada).
          </p>
          <img src={cotizaciones} alt="cotizaciones" className="dashboardIcon" />
        </div>

        <div className="dashCard">
          <h3>Reservas</h3>
          <h4>Servicios confirmados ejecutados o por realizar.</h4>
          <p>
            Gestiona las reservas generadas a partir de cotizaciones aprobadas, permitiendo su seguimiento operativo y
            control de estado durante el ciclo del servicio.
          </p>
          <img src={reservas} alt="reservas" className="dashboardIcon" />
        </div>
      </section>
    </div>
  );
}