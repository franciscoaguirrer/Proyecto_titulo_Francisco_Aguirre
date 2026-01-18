import http from "./http";

export type Servicio = {
  _id: string;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ServicioCreate = {
  nombre: string;
  descripcion?: string;
  precioBase: number | string;
};

function normalizeServicioPayload(payload: ServicioCreate) {
  return {
    nombre: String(payload.nombre ?? "").trim(),
    descripcion: String(payload.descripcion ?? "").trim(),
    precioBase: Number(payload.precioBase),
  };
}

export async function getServiciosApi(): Promise<Servicio[]> {
  const { data } = await http.get("/api/servicios");
  return data;
}

export async function createServicioApi(payload: ServicioCreate): Promise<Servicio> {
  const body = normalizeServicioPayload(payload);
  const { data } = await http.post("/api/servicios", body);
  return data;
}

export async function updateServicioApi(id: string, payload: ServicioCreate): Promise<Servicio> {
  const body = normalizeServicioPayload(payload);
  const { data } = await http.patch(`/api/servicios/${id}`, body);
  return data;
}

export async function deleteServicioApi(id: string): Promise<{ message?: string } | Servicio> {
  const { data } = await http.delete(`/api/servicios/${id}`);
  return data;
}