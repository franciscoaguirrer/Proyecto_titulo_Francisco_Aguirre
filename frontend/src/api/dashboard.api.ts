import http from "./http";

export type DashboardResumen = {
  clientesActivos: number;
  cotizacionesPendientes: number;
  cotizacionesAprobadas: number;
  reservasActivas: number;
  ventasMes: number;
  cotPendientesProximas?: number;
  periodo?: {
    ventasDesde: string;
    ventasHasta: string;
  };
};

export async function getDashboardResumenApi(): Promise<DashboardResumen> {
  const { data } = await http.get("/api/dashboard/resumen");
  return data;
}