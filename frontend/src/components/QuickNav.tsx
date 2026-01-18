import { NavLink } from "react-router-dom";
import "/src/styles/QuickNav.css";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function QuickNav() {
  const auth = useContext(AuthContext);
  const role = auth?.user?.role;

  return (
    <nav className="quicknav">
      <NavLink to="/dashboard" className="qbtn">
        Inicio
      </NavLink>

      <NavLink to="/clientes" className="qbtn">
        Clientes
      </NavLink>

      <NavLink to="/servicios" className="qbtn">
        Servicios
      </NavLink>

      <NavLink to="/cotizaciones" className="qbtn">
        Cotizaciones
      </NavLink>

      <NavLink to="/reservas" className="qbtn">
        Reservas
      </NavLink>

      {role === "admin" && (
        <NavLink to="/admin/usuarios" className="qbtn">
          Usuarios
        </NavLink>
      )}
    </nav>
  );
}