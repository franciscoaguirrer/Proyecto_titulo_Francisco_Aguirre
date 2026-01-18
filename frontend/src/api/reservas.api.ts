import http from "./http";
import type { CotizacionItem, ClienteMini } from "./cotizaciones.api";

export type ReservaEstado = "confirmada" | "cancelada" | "finalizada";

export type Reserva = {
  _id: string;

  cotizacionId: any; 
  clienteId: ClienteMini | string;

  fechaServicio: string;
  pasajeros: number;
  origen: string;
  destino: string;

  items: CotizacionItem[];
  total: number;

  estado: ReservaEstado;
  observaciones?: string;

  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ReservaCreate = {
  cotizacionId: string;
  observaciones?: string;
};

export type ReservaUpdate = {
  estado?: ReservaEstado;
  observaciones?: string;
};

export async function getReservasApi(): Promise<Reserva[]> {
  const { data } = await http.get("/api/reservas");
  return data;
}

export async function createReservaApi(payload: ReservaCreate): Promise<Reserva> {
  const { data } = await http.post("/api/reservas", payload);
  return data;
}

export async function updateReservaApi(id: string, payload: ReservaUpdate): Promise<Reserva> {
  const { data } = await http.patch(`/api/reservas/${id}`, payload);
  return data;
}

export async function deleteReservaApi(id: string): Promise<any> {
  const { data } = await http.delete(`/api/reservas/${id}`);
  return data;
}