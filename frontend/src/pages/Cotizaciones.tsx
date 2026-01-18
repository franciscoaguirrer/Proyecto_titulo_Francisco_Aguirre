import { useEffect, useMemo, useState } from "react";
import "../styles/cotizaciones.css";

import { getClientesApi, type Cliente } from "../api/clientes.api";
import { getServiciosApi, type Servicio } from "../api/servicios.api";

import {
  createCotizacionApi,
  deleteCotizacionApi,
  getCotizacionesApi,
  updateCotizacionApi,
  updateEstadoCotizacionApi,
  type Cotizacion,
  type CotizacionCreate,
  type CotizacionEstado,
  type CotizacionItem,
} from "../api/cotizaciones.api";
import QuickNav from "../components/QuickNav";

type Row = {
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
};

const emptyForm: CotizacionCreate = {
  clienteId: "",
  origen: "",
  destino: "",
  fechaServicio: "",
  pasajeros: 1,
  items: [],
  observaciones: "",
};

function toDateInputValue(isoOrDate: string) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Cotizaciones() {
  const [items, setItems] = useState<Cotizacion[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  const [form, setForm] = useState<CotizacionCreate>(emptyForm);
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setErr("");
    setLoading(true);
    try {
      const [cots, cls, srvs] = await Promise.all([
        getCotizacionesApi(),
        getClientesApi(),
        getServiciosApi(),
      ]);

      setItems(Array.isArray(cots) ? cots : []);
      setClientes(Array.isArray(cls) ? cls : []);
      setServicios(Array.isArray(srvs) ? srvs : []);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const serviciosMap = useMemo(() => {
    const m = new Map<string, Servicio>();
    servicios.forEach((s) => m.set(s._id, s));
    return m;
  }, [servicios]);

  const totalLocal = useMemo(() => {
    return rows.reduce(
      (acc, r) => acc + Number(r.cantidad || 0) * Number(r.precioUnitario || 0),
      0
    );
  }, [rows]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setRows([]);
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEdit(cot: Cotizacion) {
    setEditingId(cot._id);

    const clienteId =
      typeof cot.clienteId === "string" ? cot.clienteId : cot.clienteId?._id;

    setForm({
      clienteId: clienteId || "",
      origen: cot.origen || "",
      destino: cot.destino || "",
      fechaServicio: toDateInputValue(cot.fechaServicio),
      pasajeros: Number(cot.pasajeros || 1),
      observaciones: cot.observaciones || "",
      items: cot.items || [],
    });

    setRows(
      (cot.items || []).map((it) => ({
        servicioId: String(it.servicioId),
        cantidad: Number(it.cantidad || 1),
        precioUnitario: Number(it.precioUnitario || 0),
      }))
    );

    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addRow() {
    if (!servicios.length) {
      setErr("No hay servicios disponibles para cotizar.");
      return;
    }
    const first = servicios[0];
    setRows((prev) => [
      ...prev,
      {
        servicioId: first._id,
        cantidad: 1,
        precioUnitario: Number((first as any).precioBase || 0),
      },
    ]);
  }

  function removeRow(idx: number) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function changeRow(idx: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function normalizePayload(): CotizacionCreate {
    const items: CotizacionItem[] = rows.map((r) => {
      const srv = serviciosMap.get(r.servicioId);
      const cantidad = Math.max(1, Number(r.cantidad || 1));
      const precioUnitario = Math.max(0, Number(r.precioUnitario || 0));
      const subtotal = cantidad * precioUnitario;

      return {
        servicioId: r.servicioId,
        nombreServicio: srv?.nombre || "",
        cantidad,
        precioUnitario,
        subtotal,
      };
    });

    return {
      clienteId: String(form.clienteId || ""),
      origen: String(form.origen || "").trim(),
      destino: String(form.destino || "").trim(),
      fechaServicio: form.fechaServicio, // yyyy-mm-dd
      pasajeros: Math.max(1, Number(form.pasajeros || 1)),
      observaciones: String(form.observaciones || "").trim(),
      items,
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!form.clienteId) return setErr("Debe seleccionar un cliente.");
    if (!form.origen.trim()) return setErr("El origen es obligatorio.");
    if (!form.destino.trim()) return setErr("El destino es obligatorio.");
    if (!form.fechaServicio) return setErr("La fecha de servicio es obligatoria.");
    if (Number(form.pasajeros) < 1) return setErr("Los pasajeros deben ser 1 o más.");
    if (!rows.length) return setErr("Debe agregar al menos un servicio.");

    for (const r of rows) {
      if (!r.servicioId) return setErr("Hay un servicio sin seleccionar.");
      if (Number(r.cantidad) < 1) return setErr("La cantidad debe ser 1 o más.");
      if (Number(r.precioUnitario) < 0) return setErr("El precio unitario no puede ser negativo.");
    }

    const payload = normalizePayload();

    setSaving(true);
    try {
      if (editingId) await updateCotizacionApi(editingId, payload);
      else await createCotizacionApi(payload);

      startCreate();
      await loadAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al guardar cotización");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("¿Eliminar esta cotización?");
    if (!ok) return;

    setErr("");
    try {
      await deleteCotizacionApi(id);
      await loadAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al eliminar cotización");
    }
  }

  async function onChangeEstado(id: string, estado: CotizacionEstado) {
    setErr("");
    try {
      await updateEstadoCotizacionApi(id, estado);
      await loadAll();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al cambiar estado");
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;

    return items.filter((c) => {
      const cli =
        typeof c.clienteId === "string"
          ? c.clienteId
          : `${c.clienteId?.nombre || ""} ${c.clienteId?.rut || ""} ${c.clienteId?.email || ""}`;

      const serviciosTxt = (c.items || []).map((it) => it.nombreServicio).join(" ");
      return `${cli} ${serviciosTxt} ${c.estado} ${c.total} ${c.origen} ${c.destino}`
        .toLowerCase()
        .includes(term);
    });
  }, [items, q]);

  return (
    <div className="page">
          <QuickNav />
              {/* resto de la página */}
          <header className="pageHeader"></header>
      <header className="pageHeader">
        <h2>Cotizaciones</h2>
        <p className="muted">
          cotización con 1 o más servicios. Precio unitario editable.
        </p>
      </header>

      {/* FORM */}
      <section className="card">
        <div className="cardHeader">
          <h3>{editingId ? "Editar cotización" : "Nueva cotización"}</h3>
          {editingId && (
            <button className="btn" type="button" onClick={startCreate}>
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="formGrid">
          <div className="field full">
            <label>Cliente *</label>
            <select
              value={form.clienteId}
              onChange={(e) => setForm((p) => ({ ...p, clienteId: e.target.value }))}
              required
            >
              <option value="">-- Seleccione cliente --</option>
              {clientes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nombre} {c.rut ? `(${c.rut})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Origen *</label>
            <input
              value={form.origen}
              onChange={(e) => setForm((p) => ({ ...p, origen: e.target.value }))}
              placeholder="Ej: Santiago Centro"
              required
            />
          </div>

          <div className="field">
            <label>Destino *</label>
            <input
              value={form.destino}
              onChange={(e) => setForm((p) => ({ ...p, destino: e.target.value }))}
              placeholder="Ej: Aeropuerto SCL"
              required
            />
          </div>

          <div className="field">
            <label>Fecha de servicio *</label>
            <input
              type="date"
              value={form.fechaServicio}
              onChange={(e) => setForm((p) => ({ ...p, fechaServicio: e.target.value }))}
              required
            />
          </div>

          <div className="field">
            <label>Pasajeros *</label>
            <input
              inputMode="numeric"
              value={String(form.pasajeros)}
              onChange={(e) => setForm((p) => ({ ...p, pasajeros: Number(e.target.value || 1) }))}
              required
            />
          </div>

          <div className="field full">
            <label>Observaciones</label>
            <input
              value={form.observaciones || ""}
              onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))}
              placeholder="Ej: Incluye peajes, ida y regreso..."
            />
          </div>

          <div className="divider full" />

          <div className="field full rowHeader">
            <label>Servicios *</label>
            <button className="btn" type="button" onClick={addRow}>
              + Agregar servicio
            </button>
          </div>

          <div className="full">
            {!rows.length ? (
              <p className="muted">Aún no agregas servicios.</p>
            ) : (
              <div className="itemsTableWrap">
                <table className="itemsTable">
                  <thead>
                    <tr>
                      <th>Servicio</th>
                      <th style={{ width: 110 }}>Cantidad</th>
                      <th style={{ width: 160 }}>Precio unitario</th>
                      <th style={{ width: 160 }}>Subtotal</th>
                      <th style={{ width: 110 }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, idx) => {
                      const srv = serviciosMap.get(r.servicioId);
                      const subtotal = Number(r.cantidad || 0) * Number(r.precioUnitario || 0);

                      return (
                        <tr key={idx}>
                          <td>
                            <select
                              value={r.servicioId}
                              onChange={(e) => {
                                const newId = e.target.value;
                                const s = serviciosMap.get(newId);
                                changeRow(idx, {
                                  servicioId: newId,
                                  precioUnitario: Number((s as any)?.precioBase || 0),
                                });
                              }}
                            >
                              {servicios.map((s) => (
                                <option key={s._id} value={s._id}>
                                  {s.nombre}
                                </option>
                              ))}
                            </select>
                            {srv?.descripcion ? <div className="hint">{srv.descripcion}</div> : null}
                          </td>

                          <td>
                            <input
                              inputMode="numeric"
                              value={String(r.cantidad)}
                              onChange={(e) => changeRow(idx, { cantidad: Number(e.target.value || 1) })}
                            />
                          </td>

                          <td>
                            <input
                              inputMode="numeric"
                              value={String(r.precioUnitario)}
                              onChange={(e) =>
                                changeRow(idx, { precioUnitario: Number(e.target.value || 0) })
                              }
                            />
                          </td>

                          <td>${Number(subtotal || 0).toLocaleString("es-CL")}</td>

                          <td>
                            <button className="btn danger" type="button" onClick={() => removeRow(idx)}>
                              Quitar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="field full totalBox">
            <b>Total:</b> <span>${Number(totalLocal).toLocaleString("es-CL")}</span>
          </div>

          {err && <div className="error full">{err}</div>}

          <div className="actions full">
            <button className="btn primary" disabled={saving} type="submit">
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear cotización"}
            </button>
          </div>
        </form>
      </section>

      {/* LIST */}
      <section className="card">
        <div className="cardHeader">
          <h3>Listado</h3>
          <input
            className="search"
            placeholder="Buscar por cliente, servicio, origen/destino, estado o total..."
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
                  {filtered.map((c) => {
                    const cli =
                      typeof c.clienteId === "string"
                        ? c.clienteId
                        : `${c.clienteId?.nombre || "-"} ${
                            c.clienteId?.rut ? `(${c.clienteId.rut})` : ""
                          }`;

                    const serviciosTxt =
                      (c.items || [])
                        .map((it) => `${it.nombreServicio} x${it.cantidad}`)
                        .join(", ") || "-";

                    const fecha = c.fechaServicio ? toDateInputValue(c.fechaServicio) : "-";

                    return (
                      <tr key={c._id}>
                        <td>{cli}</td>
                        <td>
                          <div><b>{c.origen}</b> → <b>{c.destino}</b></div>
                          <div className="muted">Fecha: {fecha} • Pasajeros: {c.pasajeros}</div>
                        </td>
                        <td>{serviciosTxt}</td>
                        <td>${Number(c.total || 0).toLocaleString("es-CL")}</td>
                        <td>
                          <span className={`badge ${c.estado}`}>{c.estado}</span>
                        </td>
                        <td className="rowActions">
                          <button className="btn" type="button" onClick={() => startEdit(c)}>
                            Editar
                          </button>

                          <select
                            className="estadoSelect"
                            value={c.estado}
                            onChange={(e) =>
                              onChangeEstado(c._id, e.target.value as CotizacionEstado)
                            }
                          >
                            <option value="pendiente">pendiente</option>
                            <option value="aprobada">aprobada</option>
                            <option value="rechazada">rechazada</option>
                          </select>

                          <button className="btn danger" type="button" onClick={() => onDelete(c._id)}>
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