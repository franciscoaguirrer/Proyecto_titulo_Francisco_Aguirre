import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Servicios from "./pages/Servicios";
import Cotizaciones from "./pages/Cotizaciones";
import Reservas from "./pages/Reservas";
import AdminUsuarios from "./pages/AdminUsuarios";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleRoute } from "./auth/RoleRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

         {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* RUTAS PRIVADAS */}  
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/reservas" element={<Reservas />} />
          
          <Route element={<RoleRoute allow={["admin"]} />}>
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}