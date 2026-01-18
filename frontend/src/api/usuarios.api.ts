import http from "./http";

export type Usuario = {
  _id: string;
  email: string;
  role: "admin" | "operador";
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UsuarioCreate = {
  email: string;
  password: string;
  role?: "admin" | "operador";
};

export type UsuarioUpdate = Partial<Pick<Usuario, "role" | "active" | "email">>;

const BASE = "/api/usuarios";

export async function getUsuariosApi(): Promise<Usuario[]> {
  const { data } = await http.get(BASE);
  return data;
}

export async function createUsuarioApi(payload: UsuarioCreate) {
  const { data } = await http.post(BASE, payload);
  return data;
}

export async function updateUsuarioApi(id: string, payload: UsuarioUpdate) {
  const { data } = await http.patch(`${BASE}/${id}`, payload);
  return data;
}

export async function disableUsuarioApi(id: string) {
  const { data } = await http.delete(`${BASE}/${id}`);
  return data;
}