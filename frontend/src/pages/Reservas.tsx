import { useEffect, useMemo, useState } from "react";
import "../styles/reservas.css";

import { getCotizacionesApi, type Cotizacion } from "../api/cotizaciones.api";
import {
  createReservaApi,
  deleteReservaApi,
  getReservasApi,
  updateReservaApi,
  type Reserva,
  type ReservaEstado,
} from "../api/reservas.api";

import { useAuth } from "../auth/useAuth";
import QuickNav from "../components/QuickNav";

function toDateInputValue(isoOrDate: string) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function clienteLabel(cot: Cotizacion) {
  const cli =
    typeof cot.clienteId === "string"
      ? cot.clienteId
      : `${cot.clienteId?.nombre || "-"} ${cot.clienteId?.rut ? `(${cot.clienteId.rut})` : ""}`;
  return cli;
}

export default function Reservas() {
  const { user } = useAuth();
  const rol = user?.rol || user?.role;
  const isAdmin = rol === "admin";

  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  const [cotizacionId, setCotizacionId] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setErr("");
    setLoading(true);
    try {
      const [cots, resvs] = await Promise.all([getCotizacionesApi(), getReservasApi()]);
      setCotizaciones(Array.isArray(cots) ? cots : []);
      setReservas(Array.isArray(resvs) ? resvs : []);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const reservasByCotId = useMemo(() => {
    const s = new Set<string>();
    reservas.forEach((r) => {
      const id = typeof r.cotizacionId === "string" ? r.cotizacionId : r.cotizacionId?._id;
      if (id) s.add(String(id));
    });
    return s;
  }, [reservas]);

  const cotizacionesAprobadas = useMemo(() => {
    return cotizaciones
      .filter((c) => c.active !== false)
      .filter((c) => c.estado === "aprobada")
      .filter((c) => !reservasByCotId.has(String(c._id)));
  }, [cotizaciones, reservasByCotId]);

  async function onCreateReserva(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!cotizacionId) return setErr("Debe seleccionar una cotización aprobada.");

    setSaving(true);
    try {
      await createReservaApi({ cotizacionId, observaciones });
      setCotizacionId("");
      setObservaciones("");
      await loadAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al crear reserva");
    } finally {
      setSaving(false);
    }
  }

  async function onChangeEstado(id: string, estado: ReservaEstado) {
    setErr("");
    try {
      await updateReservaApi(id, { estado });
      await loadAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al cambiar estado");
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("¿Eliminar esta reserva? (borrado lógico)");
    if (!ok) return;

    setErr("");
    try {
      await deleteReservaApi(id);
      await loadAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al eliminar reserva");
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return reservas;

    return reservas.filter((r) => {
      const cli =
        typeof r.clienteId === "string"
          ? r.clienteId
          : `${r.clienteId?.nombre || ""} ${r.clienteId?.rut || ""} ${r.clienteId?.email || ""}`;

      const serviciosTxt = (r.items || []).map((it) => it.nombreServicio).join(" ");
      const fecha = r.fechaServicio ? toDateInputValue(r.fechaServicio) : "";

      return `${cli} ${serviciosTxt} ${r.estado} ${r.total} ${r.origen} ${r.destino} ${fecha}`
        .toLowerCase()
        .includes(term);
    });
  }, [reservas, q]);

  return (
    <div className="page">
          <QuickNav />
          <header className="pageHeader">
        <h2>Reservas</h2>
        <p className="muted">Reservas solo se pueden gestionar desde cotizaciones aprobadas.</p>
      </header>

      {/* FORM CREAR */}
      <section className="card">
        <div className="cardHeader">
          <h3>Nueva reserva</h3>
        </div>

        <form onSubmit={onCreateReserva} className="formGrid">
          <div className="field full">
            <label>Cotización aprobada *</label>
            <select value={cotizacionId} onChange={(e) => setCotizacionId(e.target.value)} required>
              <option value="">-- Seleccione cotización aprobada --</option>
              {cotizacionesAprobadas.map((c) => (
                <option key={c._id} value={c._id}>
                  {clienteLabel(c)} • {c.origen} → {c.destino} • {toDateInputValue(c.fechaServicio)} • Total $
                  {Number(c.total || 0).toLocaleString("es-CL")}
                </option>
              ))}
            </select>
            {!cotizacionesAprobadas.length ? (
              <div className="hint">No hay cotizaciones aprobadas disponibles (o ya están reservadas).</div>
            ) : null}
          </div>

          <div className="field full">
            <label>Observaciones</label>
            <input
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: pasajero espera en puerta, equipaje extra..."
            />
          </div>

          {err && <div className="error full">{err}</div>}

          <div className="actions full">
            <button className="btn primary" disabled={saving || !cotizacionesAprobadas.length} type="submit">
              {saving ? "Creando..." : "Crear reserva"}
            </button>
          </div>
        </form>
      </section>

      {/* LISTADO */}
      <section className="card">
        <div className="cardHeader">
          <h3>Listado</h3>
          <input
            className="search"
            placeholder="Buscar por cliente, servicio, ruta, fecha, estado o total..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="muted">Cargando...</p>
        ) : (
          <>
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Ruta / Fecha</th>
                    <th>Servicios</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const cli =
                      typeof r.clienteId === "string"
                        ? r.clienteId
                        : `${r.clienteId?.nombre || "-"} ${r.clienteId?.rut ? `(${r.clienteId.rut})` : ""}`;

                    const serviciosTxt =
                      (r.items || []).map((it) => `${it.nombreServicio} x${it.cantidad}`).join(", ") || "-";

                    const fecha = r.fechaServicio ? toDateInputValue(r.fechaServicio) : "-";

                    return (
                      <tr key={r._id}>
                        <td>{cli}</td>
                        <td>
                          <div>
                            <b>{r.origen}</b> → <b>{r.destino}</b>
                          </div>
                          <div className="muted">
                            Fecha: {fecha} • Pasajeros: {r.pasajeros}
                          </div>
                        </td>
                        <td>{serviciosTxt}</td>
                        <td>${Number(r.total || 0).toLocaleString("es-CL")}</td>
                        <td>
                          <span className={`badge ${r.estado}`}>{r.estado}</span>
                        </td>
                        <td className="rowActions">
                          <select
                            className="estadoSelect"
                            value={r.estado}
                            onChange={(e) => onChangeEstado(r._id, e.target.value as ReservaEstado)}
                          >
                            <option value="confirmada">confirmada</option>
                            <option value="cancelada">cancelada</option>
                            <option value="finalizada">finalizada</option>
                          </select>

                          <button
                            className="btn danger"
                            type="button"
                            onClick={() => onDelete(r._id)}
                            disabled={!isAdmin}
                            title={!isAdmin ? "Solo admin puede eliminar reservas" : "Eliminar"}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!filtered.length && <p className="muted">Sin resultados.</p>}
          </>
        )}
      </section>
    </div>
  );
}