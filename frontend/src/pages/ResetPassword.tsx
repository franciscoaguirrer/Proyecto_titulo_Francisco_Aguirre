import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import http from "../api/http";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate() {
    if (!token) return "Token inválido o ausente.";
    if (!email) return "Email inválido o ausente.";
    if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (password !== confirm) return "Las contraseñas no coinciden.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      await http.post("/api/auth/reset-password", {
        email,
        token,
        newPassword: password,
      });
      setDone(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || "No se pudo restablecer la contraseña. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Restablecer contraseña</h2>

        {done ? (
          <div>
            <div style={{ background: "#ecfdf5", border: "1px solid #10b98133", padding: 12, borderRadius: 10, marginBottom: 14 }}>
              Contraseña actualizada correctamente. Ya puedes iniciar sesión.
            </div>
            <Link to="/login" style={{ textDecoration: "none" }}>Ir a iniciar sesión</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <label style={{ display: "block", marginBottom: 6 }}>Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", marginBottom: 10 }}
              disabled={loading}
            />

            <label style={{ display: "block", marginBottom: 6 }}>Confirmar contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", marginBottom: 10 }}
              disabled={loading}
            />

            {error && <div style={{ color: "#b91c1c", marginBottom: 10 }}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Guardando..." : "Actualizar contraseña"}
            </button>

            <div style={{ marginTop: 12 }}>
              <Link to="/login" style={{ textDecoration: "none" }}>Volver</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}