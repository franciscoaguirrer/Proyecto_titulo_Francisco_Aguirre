import { useState } from "react";
import { Link } from "react-router-dom";
import http from "../api/http"; // ajusta si tu ruta es distinta (ej: "@/api/http")

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      setError("Ingresa un correo válido.");
      return;
    }

    setLoading(true);
    try {
      await http.post("/api/auth/forgot-password", { email: cleanEmail });
      setDone(true);
    } catch (err: any) {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420, border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>Recuperar contraseña</h2>
        <p style={{ marginTop: 0, marginBottom: 16, color: "#4b5563" }}>
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {done ? (
          <div>
            <div style={{ background: "#ecfdf5", border: "1px solid #10b98133", padding: 12, borderRadius: 10, marginBottom: 14 }}>
              Si el correo está registrado, recibirás instrucciones en unos minutos.
            </div>

            <Link to="/login" style={{ display: "inline-block", textDecoration: "none" }}>
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <label style={{ display: "block", marginBottom: 6 }}>Correo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tuemail@correo.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                marginBottom: 10
              }}
              disabled={loading}
            />

            {error && (
              <div style={{ color: "#b91c1c", marginBottom: 10 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>

            <div style={{ marginTop: 12 }}>
              <Link to="/login" style={{ textDecoration: "none" }}>
                Volver
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}