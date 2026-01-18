import { useEffect, useMemo, useState } from "react";
import {
  createServicioApi,
  deleteServicioApi,
  getServiciosApi,
  updateServicioApi,
  type Servicio,
  type ServicioCreate,
} from "../api/servicios.api";
import "../styles/servicios.css";
import QuickNav from "../components/QuickNav";

const emptyForm: ServicioCreate = {
  nombre: "",
  descripcion: "",
  precioBase: "",
};

export default function Servicios() {
  const [items, setItems] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [q, setQ] = useState("");
  const [form, setForm] = useState<ServicioCreate>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await getServiciosApi();
      const arr = Array.isArray(data) ? data : [];
      setItems(arr.filter((s) => s.active !== false));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((s) =>
      [s.nombre, s.descripcion, String(s.precioBase)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [items, q]);

  function onChange<K extends keyof ServicioCreate>(key: K, value: ServicioCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErr("");
  }

  function startEdit(s: Servicio) {
    setEditingId(s._id);
    setForm({
      nombre: s.nombre ?? "",
      descripcion: s.descripcion ?? "",
      precioBase: s.precioBase ?? "",
    });
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function normalizePayload(): ServicioCreate {
    return {
      nombre: String(form.nombre ?? "").trim(),
      descripcion: String(form.descripcion ?? "").trim(),
      precioBase: String(form.precioBase ?? "").trim(),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const payload = normalizePayload();

    if (!payload.nombre) {
      setErr("El nombre del servicio es obligatorio.");
      return;
    }

    const price = Number(payload.precioBase);
    if (Number.isNaN(price) || price < 0) {
      setErr("El precio base debe ser un número mayor o igual a 0.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateServicioApi(editingId, { ...payload, precioBase: price });
      } else {
        await createServicioApi({ ...payload, precioBase: price });
      }
      startCreate();
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al guardar servicio");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("¿Eliminar este servicio?");
    if (!ok) return;

    setErr("");
    try {
      await deleteServicioApi(id);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al eliminar servicio");
    }
  }

  return (
    <div className="page">
          <QuickNav />
          <header className="pageHeader">
        <h2>Servicios</h2>
        <p className="muted">Gestión de servicios: crear, editar y eliminar.</p>
      </header>

      {/* FORM */}
      <section className="card">
        <div className="cardHeader">
          <h3>{editingId ? "Editar servicio" : "Nuevo servicio"}</h3>
          {editingId && (
            <button className="btn" type="button" onClick={startCreate}>
              Cancelar edición
            </button>
          )}
        </div>

        <form className="formGrid" onSubmit={onSubmit}>
          <div className="field">
            <label>Nombre *</label>
            <input
              value={form.nombre}
              onChange={(e) => onChange("nombre", e.target.value)}
              placeholder="Ej: Traslado Aeropuerto"
              required
            />
          </div>

          <div className="field">
            <label>Precio base (referencial) *</label>
            <input
              value={String(form.precioBase)}
              onChange={(e) => onChange("precioBase", e.target.value)}
              placeholder="Ej: 30000"
              inputMode="numeric"
            />
            <small className="hint">
              Precio referencial ajustable en cotización.
            </small>
          </div>

          <div className="field full">
            <label>Descripción</label>
            <input
              value={form.descripcion}
              onChange={(e) => onChange("descripcion", e.target.value)}
              placeholder="Ej: Servicio ida o regreso desde SCL"
            />
          </div>

          {err && <div className="error full">{err}</div>}

          <div className="actions full">
            <button className="btn primary" disabled={saving} type="submit">
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear servicio"}
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
            placeholder="Buscar por nombre, descripción o precio..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="muted">Cargando...</p>
        ) : (
          <>
            {/* Tabla escritorio */}
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio base</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s._id}>
                      <td>{s.nombre}</td>
                      <td>{s.descripcion || "-"}</td>
                      <td>${Number(s.precioBase || 0).toLocaleString("es-CL")}</td>
                      <td className="rowActions">
                        <button className="btn" type="button" onClick={() => startEdit(s)}>
                          Editar
                        </button>
                        <button className="btn danger" type="button" onClick={() => onDelete(s._id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards móvil */}
            <div className="cards">
              {filtered.map((s) => (
                <div className="miniCard" key={s._id}>
                  <div className="miniTop">
                    <b>{s.nombre}</b>
                    <span className="muted">${Number(s.precioBase || 0).toLocaleString("es-CL")}</span>
                  </div>

                  <div className="miniBody">
                    <div>
                      <span className="muted">Descripción:</span> {s.descripcion || "-"}
                    </div>
                  </div>

                  <div className="miniActions">
                    <button className="btn" type="button" onClick={() => startEdit(s)}>
                      Editar
                    </button>
                    <button className="btn danger" type="button" onClick={() => onDelete(s._id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!filtered.length && <p className="muted">Sin resultados.</p>}
          </>
        )}
      </section>
    </div>
  );
}