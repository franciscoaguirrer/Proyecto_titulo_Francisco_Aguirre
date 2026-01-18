import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export function RoleRoute({ allow }: { allow: string[] }) {
  const { user, isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;

  const rol = user?.rol || user?.role;
  return rol && allow.includes(rol) ? <Outlet /> : <Navigate to="/dashboard" replace />;
}