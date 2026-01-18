import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
});

// Adjunta token en cada request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("mt_token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default http;