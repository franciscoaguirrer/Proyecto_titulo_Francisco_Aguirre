import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function ProtectedRoute() {
  const auth = useContext(AuthContext);

  if (!auth) return <Navigate to="/login" replace />;

  if (!auth.ready) return <div style={{ padding: 20 }}>Cargando...</div>;

  return auth.isAuthed ? <Outlet /> : <Navigate to="/login" replace />;
}