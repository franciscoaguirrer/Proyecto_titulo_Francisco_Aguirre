import { useEffect, useMemo, useState } from "react";
import QuickNav from "../components/QuickNav";
import {
  createClienteApi,
  deleteClienteApi,
  getClientesApi,
  updateClienteApi,
  getClienteByRutApi,
  reactivateClienteApi,
  type Cliente,
  type ClienteCreate,
} from "../api/clientes.api";
import "/src/styles/clientes.css";

const emptyForm: ClienteCreate = {
  nombre: "",
  email: "",
  telefono: "",
  rut: "",
  direccion: "",
};


export default function Clientes() {
  const [items, setItems] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [q, setQ] = useState("");
  const [form, setForm] = useState<ClienteCreate>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await getClientesApi();
      const arr = Array.isArray(data) ? data : [];
      setItems(arr.filter((c) => c.active !== false));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al cargar clientes");
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
    return items.filter((c) =>
      [c.nombre, c.email, c.telefono, c.rut]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [items, q]);

  function onChange<K extends keyof ClienteCreate>(key: K, value: ClienteCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setErr("");
  }

  function startEdit(c: Cliente) {
    setEditingId(c._id);
    setForm({
      nombre: c.nombre ?? "",
      email: c.email ?? "",
      telefono: c.telefono ?? "",
      rut: c.rut ?? "",
      direccion: c.direccion ?? "",
    });
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function normalizePayload(): ClienteCreate {
    return {
      ...form,
      nombre: form.nombre.trim(),
      email: form.email?.trim() || "",
      telefono: form.telefono?.trim() || "",
      rut: form.rut?.trim() || "",
      direccion: form.direccion?.trim() || "",
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!form.nombre.trim()) {
      setErr("El nombre es obligatorio.");
      return;
    }
    if (form.email && !form.email.includes("@")) {
      setErr("El email no es válido.");
      return;
    }

    const payload = normalizePayload();

    setSaving(true);
    try {
      if (editingId) {
        await updateClienteApi(editingId, payload);
      } else {
        await createClienteApi(payload);
      }

      startCreate();
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Error al guardar cliente";
      const code = e?.response?.data?.code;
      const clienteId = e?.response?.data?.clienteId;

      if (!editingId && code === "CLIENTE_INACTIVO" && clienteId) {
        const ok = confirm("Este RUT pertenece a un cliente eliminado. ¿Deseas reactivarlo?");
        if (ok) {
          await reactivateClienteApi(clienteId, payload);
          startCreate();
          await load();
          return;
        }
      }

      if (!editingId && payload.rut) {
        try {
          const existente = await getClienteByRutApi(payload.rut);
          if (existente && existente.active === false) {
            const ok = confirm("Este RUT pertenece a un cliente eliminado. ¿Deseas reactivarlo?");
            if (ok) {
              await reactivateClienteApi(existente._id, payload);
              startCreate();
              await load();
              return;
            }
          }
        } catch {
        }
      }

      setErr(msg);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("¿Eliminar este cliente?");
    if (!ok) return;

    setErr("");
    try {
      await deleteClienteApi(id);
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al eliminar cliente");
    }
  }

  return (
  
    <div className="page">
      <QuickNav />
          {/* resto de la página */}
      <header className="pageHeader">
        <h2>Clientes</h2>
        <p className="muted">Gestión de clientes: crear, editar y eliminar.</p>
      </header>

      {/* FORM */}
      <section className="card">
        <div className="cardHeader">
          <h3>{editingId ? "Editar cliente" : "Nuevo cliente"}</h3>
          {editingId && (
            <button className="btn" type="button" onClick={startCreate}>
              Cancelar edición
            </button>
          )}
        </div>

        <form className="formGrid" onSubmit={onSubmit}>
          <div className="field">
            <label>Nombre Completo*</label>
            <input
              value={form.nombre}
              onChange={(e) => onChange("nombre", e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="field">
            <label>RUT</label>
            <input
              value={form.rut}
              onChange={(e) => onChange("rut", e.target.value)}
              placeholder="Ej: 12.345.678-9"
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="Ej: cliente@email.com"
              type="email"
            />
          </div>

          <div className="field">
            <label>Teléfono</label>
            <input
              value={form.telefono}
              onChange={(e) => onChange("telefono", e.target.value)}
              placeholder="Ej: +56 9 1234 5678"
            />
          </div>

          <div className="field full">
            <label>Dirección</label>
            <input
              value={form.direccion}
              onChange={(e) => onChange("direccion", e.target.value)}
              placeholder="Ej: Santiago, RM"
            />
          </div>

          {err && <div className="error full">{err}</div>}

          <div className="actions full">
            <button className="btn primary" disabled={saving} type="submit">
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear cliente"}
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
            placeholder="Buscar por nombre, email, teléfono o RUT..."
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
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>RUT</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id}>
                      <td>{c.nombre}</td>
                      <td>{c.email || "-"}</td>
                      <td>{c.telefono || "-"}</td>
                      <td>{c.rut || "-"}</td>
                      <td className="rowActions">
                        <button className="btn" type="button" onClick={() => startEdit(c)}>
                          Editar
                        </button>
                        <button className="btn danger" type="button" onClick={() => onDelete(c._id)}>
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
              {filtered.map((c) => (
                <div className="miniCard" key={c._id}>
                  <div className="miniTop">
                    <b>{c.nombre}</b>
                    <span className="muted">{c.rut || ""}</span>
                  </div>
                  <div className="miniBody">
                    <div>
                      <span className="muted">Email:</span> {c.email || "-"}
                    </div>
                    <div>
                      <span className="muted">Tel:</span> {c.telefono || "-"}
                    </div>
                  </div>
                  <div className="miniActions">
                    <button className="btn" type="button" onClick={() => startEdit(c)}>
                      Editar
                    </button>
                    <button className="btn danger" type="button" onClick={() => onDelete(c._id)}>
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