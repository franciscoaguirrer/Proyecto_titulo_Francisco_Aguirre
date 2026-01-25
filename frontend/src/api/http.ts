import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

  http.interceptors.request.use((config) => {
  const token = localStorage.getItem("mt_token");

  const publicPaths = [
    "/api/auth/login",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
  ];

  if (token && !publicPaths.some(p => config.url?.includes(p))) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default http;