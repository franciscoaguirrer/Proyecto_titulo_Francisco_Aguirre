import { useEffect, useMemo, useState } from "react";
import QuickNav from "../components/QuickNav";
import "/src/styles/admin-usuarios.css";
import {
  getUsuariosApi,
  createUsuarioApi,
  updateUsuarioApi,
  disableUsuarioApi,
  type Usuario,
  type UsuarioCreate,
} from "../api/usuarios.api";

const emptyForm: UsuarioCreate = {
  email: "",
  password: "",
  role: "operador",
};

export default function AdminUsuarios() {
  const [items, setItems] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");
  const [q, setQ] = useState("");

  const [form, setForm] = useState<UsuarioCreate>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await getUsuariosApi();
      const arr = Array.isArray(data) ? data : [];
      setItems(arr);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al cargar usuarios");
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
    return items.filter((u) =>
      [u.email, u.role, u.active ? "activo" : "inactivo"]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [items, q]);

  function onChange<K extends keyof UsuarioCreate>(key: K, value: UsuarioCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setErr("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !email.includes("@")) {
      setErr("Debe ingresar un email válido.");
      return;
    }
    if (!password || password.length < 6) {
      setErr("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSaving(true);
    try {
      await createUsuarioApi({ ...form, email });
      resetForm();
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al crear usuario");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleActive(u: Usuario) {
    const action = u.active ? "deshabilitar" : "reactivar";
    const ok = confirm(`¿Deseas ${action} este usuario?`);
    if (!ok) return;

    setErr("");
    try {
      if (u.active) {
        await disableUsuarioApi(u._id);
      } else {
        await updateUsuarioApi(u._id, { active: true });
      }
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al actualizar usuario");
    }
  }

  async function onChangeRole(u: Usuario, role: "admin" | "operador") {
    if (u.role === role) return;

    const ok = confirm(`¿Cambiar rol de ${u.email} a "${role}"?`);
    if (!ok) return;

    setErr("");
    try {
      await updateUsuarioApi(u._id, { role });
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Error al cambiar rol");
    }
  }

  return (
    <div className="page">
      <QuickNav />

      <header className="pageHeader">
        <h2>Administración de Usuarios</h2>
        <p className="muted">Módulo exclusivo para rol Admin: crear usuarios, asignar roles y deshabilitar cuentas.</p>
      </header>

      {/* FORM */}
      <section className="card">
        <div className="cardHeader">
          <h3>Crear usuario</h3>
          <button className="btn" type="button" onClick={resetForm}>
            Limpiar
          </button>
        </div>

        <form className="formGrid" onSubmit={onSubmit}>
          <div className="field">
            <label>Email*</label>
            <input
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="Ej: operador@makingtrips.cl"
              type="email"
              required
            />
          </div>

          <div className="field">
            <label>Contraseña*</label>
            <input
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              placeholder="Mínimo 6 caracteres"
              type="password"
              required
            />
          </div>

          <div className="field">
            <label>Rol</label>
            <select value={form.role} onChange={(e) => onChange("role", e.target.value as any)}>
              <option value="operador">operador</option>
              <option value="admin">admin</option>
            </select>
          </div>

          {err && <div className="error full">{err}</div>}

          <div className="actions full">
            <button className="btn primary" disabled={saving} type="submit">
              {saving ? "Creando..." : "Crear usuario"}
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
            placeholder="Buscar por email, rol o estado..."
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
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id}>
                      <td>{u.email}</td>
                      <td>
                        <span className="pill">{u.role}</span>
                      </td>
                      <td>
                        <span className={u.active ? "status ok" : "status off"}>
                          {u.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="rowActions">
                        <div className="roleGroup">
                          <button
                            className="btn"
                            type="button"
                            disabled={!u.active || u.role === "operador"}
                            onClick={() => onChangeRole(u, "operador")}
                            title={!u.active ? "Usuario inactivo" : "Cambiar a operador"}
                          >
                            Operador
                          </button>
                          <button
                            className="btn"
                            type="button"
                            disabled={!u.active || u.role === "admin"}
                            onClick={() => onChangeRole(u, "admin")}
                            title={!u.active ? "Usuario inactivo" : "Cambiar a admin"}
                          >
                            Admin
                          </button>
                        </div>

                        <button className={u.active ? "btn danger" : "btn"} type="button" onClick={() => onToggleActive(u)}>
                          {u.active ? "Deshabilitar" : "Reactivar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards móvil */}
            <div className="cards">
              {filtered.map((u) => (
                <div className="miniCard" key={u._id}>
                  <div className="miniTop">
                    <b>{u.email}</b>
                    <span className="muted">{u.role}</span>
                  </div>
                  <div className="miniBody">
                    <div>
                      <span className="muted">Estado:</span>{" "}
                      <span className={u.active ? "status ok" : "status off"}>
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                  <div className="miniActions">
                    <button className="btn" type="button" disabled={!u.active} onClick={() => onChangeRole(u, "operador")}>
                      Operador
                    </button>
                    <button className="btn" type="button" disabled={!u.active} onClick={() => onChangeRole(u, "admin")}>
                      Admin
                    </button>
                    <button className={u.active ? "btn danger" : "btn"} type="button" onClick={() => onToggleActive(u)}>
                      {u.active ? "Deshabilitar" : "Reactivar"}
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