import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "../styles/auth.css";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      nav("/dashboard");
    } catch (e2: any) {
      setErr(e2?.response?.data?.message || e2?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-head">
          <h1 className="auth-title"><center>Making Trips</center></h1>
          <p className="muted"><center>Inicia sesión para continuar</center></p>
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {err && <div className="error">{err}</div>}

        <button className="btn primary auth-btn" type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <div className="links">
          <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
        </div>
      </form>
    </div>
  );
}