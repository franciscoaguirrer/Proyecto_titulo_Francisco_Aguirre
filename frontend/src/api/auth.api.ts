import http from "./http";

export type LoginResponse = {
  data: any;
  usuario: { _id: string; email: string; rol?: string; role?: string; nombre?: string; name?: string; };
  token: string;
  user: {
    _id: string;
    email: string;
    rol?: string;   
    role?: string;  
    nombre?: string;
    name?: string;
  };
};

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const { data } = await http.post("/api/auth/login", { email, password });
  return data;
}

export async function forgotPasswordApi(email: string): Promise<{ message?: string }> {
  const { data } = await http.post("/api/auth/forgot-password", { email });
  return data;
}

export async function resetPasswordApi(token: string, password: string): Promise<{ message?: string }> {
  const { data } = await http.post(`/api/auth/reset-password/${token}`, { password });
  return data;
}
