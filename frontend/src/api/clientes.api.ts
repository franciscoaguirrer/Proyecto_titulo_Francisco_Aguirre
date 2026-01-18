import http from "./http";

export type Cliente = {
  _id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
  active?: boolean;
};

export type ClienteCreate = {
  nombre: string;
  email?: string;
  telefono?: string;
  rut?: string;
  direccion?: string;
};

export async function getClientesApi(): Promise<Cliente[]> {
  const { data } = await http.get("/api/clientes");
  return data;
}

export async function createClienteApi(payload: ClienteCreate): Promise<Cliente> {
  const { data } = await http.post("/api/clientes", payload);
  return data;
}

export async function updateClienteApi(id: string, payload: ClienteCreate): Promise<Cliente> {
  const { data } = await http.patch(`/api/clientes/${id}`, payload);
  return data;
}

export async function deleteClienteApi(id: string): Promise<{ message?: string }> {
  const { data } = await http.delete(`/api/clientes/${id}`);
  return data;
}

export async function getClienteByRutApi(rut: string): Promise<Cliente | null> {
  const { data } = await http.get(`/api/clientes/by-rut/${encodeURIComponent(rut)}`);
  return data;
}

// reactiva + actualiza datos
export async function reactivateClienteApi(id: string, payload: ClienteCreate): Promise<Cliente> {
  const { data } = await http.patch(`/api/clientes/${id}`, { ...payload, active: true });
  return data;
}