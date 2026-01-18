import http from "./http";

export type CotizacionEstado = "pendiente" | "aprobada" | "rechazada";

export type ClienteMini = {
  _id: string;
  nombre: string;
  rut?: string;
  email?: string;
};

export type CotizacionItem = {
  servicioId: string;
  nombreServicio?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
};

export type Cotizacion = {
  _id: string;

  clienteId: ClienteMini | string;

  origen: string;
  destino: string;
  fechaServicio: string; // ISO
  pasajeros: number;

  items: CotizacionItem[];
  total: number;

  estado: CotizacionEstado;
  observaciones?: string;

  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CotizacionCreate = {
  clienteId: string;

  origen: string;
  destino: string;
  fechaServicio: string;
  pasajeros: number;

  items: CotizacionItem[];
  observaciones?: string;
};

export async function getCotizacionesApi(): Promise<Cotizacion[]> {
  const { data } = await http.get("/api/cotizaciones");
  return data;
}

export async function createCotizacionApi(payload: CotizacionCreate): Promise<Cotizacion> {
  const { data } = await http.post("/api/cotizaciones", payload);
  return data;
}

export async function updateCotizacionApi(id: string, payload: CotizacionCreate): Promise<Cotizacion> {
  const { data } = await http.patch(`/api/cotizaciones/${id}`, payload);
  return data;
}

export async function updateEstadoCotizacionApi(id: string, estado: CotizacionEstado): Promise<Cotizacion> {
  const { data } = await http.patch(`/api/cotizaciones/${id}/estado`, { estado });
  return data;
}

export async function deleteCotizacionApi(id: string): Promise<any> {
  const { data } = await http.delete(`/api/cotizaciones/${id}`);
  return data;
}