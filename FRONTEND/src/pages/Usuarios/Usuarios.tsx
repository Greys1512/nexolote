import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Users } from 'lucide-react';
import { apiFetch } from '../../services/api';
import Modal from '../../components/common/Modal';
import type { Usuario } from '../../types/domain';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Operador');
  const [estado, setEstado] = useState('Activo');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorForm, setErrorForm] = useState('');

  const cargar = async (signal?: AbortSignal) => {
    try {
      const r = await apiFetch('/usuarios', { signal });
      if (!r.ok) throw new Error('No se pudieron obtener los usuarios.');
      setUsuarios((await r.json()) as Usuario[]);
      setError('');
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Error al consultar los usuarios.');
    } finally { setCargando(false); }
  };

  useEffect(() => {
    const c = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar(c.signal);
    return () => c.abort();
  }, []);

  const limpiar = () => { setEditando(null); setNombre(''); setCorreo(''); setPassword(''); setRol('Operador'); setEstado('Activo'); setErrorForm(''); };

  const prepararEdicion = (u: Usuario) => { setEditando(u.id_usuario); setNombre(u.nombre); setCorreo(u.correo); setPassword(''); setRol(u.rol); setEstado(u.estado); setErrorForm(''); setMensaje(''); setModalOpen(true); };

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editando === null && !password.trim()) { setErrorForm('La contraseña es obligatoria al crear un usuario.'); return; }
    setGuardando(true); setMensaje(''); setErrorForm('');
    const esEdicion = editando !== null;
    try {
      const body: Record<string, string> = { nombre: nombre.trim(), correo: correo.trim(), rol, estado };
      if (password.trim()) body.password = password;
      const r = await apiFetch(esEdicion ? `/usuarios/${editando}` : '/usuarios', { method: esEdicion ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const res = await r.json().catch(() => ({})) as { exito?: boolean; mensaje?: string; message?: string };
      if (!r.ok || res.exito === false) throw new Error(res.message || res.mensaje || 'No se pudo guardar el usuario.');
      setMensaje(res.mensaje || (esEdicion ? 'Usuario actualizado correctamente.' : 'Usuario registrado correctamente.'));
      setModalOpen(false); limpiar(); await cargar();
    } catch (e) { setErrorForm(e instanceof Error ? e.message : 'Ocurrió un error al guardar el usuario.'); }
    finally { setGuardando(false); }
  };

  const desactivar = async (id: number) => {
    if (!window.confirm('¿Deseas desactivar este usuario? El registro se conservará.')) return;
    setMensaje(''); setErrorForm('');
    try {
      const r = await apiFetch(`/usuarios/${id}`, { method: 'DELETE' });
      const res = await r.json().catch(() => ({})) as { exito?: boolean; mensaje?: string; message?: string };
      if (!r.ok || res.exito === false) throw new Error(res.message || res.mensaje || 'No se pudo desactivar el usuario.');
      if (editando === id) limpiar();
      setMensaje(res.mensaje || 'Usuario desactivado correctamente.');
      await cargar();
    } catch (e) { setErrorForm(e instanceof Error ? e.message : 'Ocurrió un error al desactivar el usuario.'); }
  };

  return (
    <section className="catalog-page">
      <section className="welcome-section">
        <div>
          <div className="eyebrow"><Users size={15} /> GESTIÓN DE USUARIOS</div>
          <h1>Usuarios del sistema</h1>
          <p>Administra las cuentas, roles y estado de acceso a NEXOLOTE.</p>
        </div>
        <div className="page-actions">
          <button className="btn-primario" onClick={() => { limpiar(); setModalOpen(true); }}><Plus size={18} /> Agregar usuario</button>
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} titulo={editando !== null ? 'Editar usuario' : 'Nuevo usuario'} icono={Users}>
        <form className="product-form" onSubmit={guardar}>
          <div className="form-field"><label htmlFor="nombreUsuario">Nombre completo</label><input id="nombreUsuario" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></div>
          <div className="form-field"><label htmlFor="correoUsuario">Correo</label><input id="correoUsuario" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required /></div>
          <div className="form-field"><label htmlFor="passwordUsuario">Contraseña {editando !== null && <small>(dejar en blanco para no cambiar)</small>}</label><input id="passwordUsuario" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={editando === null} autoComplete="new-password" /></div>
          <div className="form-row">
            <div className="form-field"><label htmlFor="rolUsuario">Rol</label><select id="rolUsuario" value={rol} onChange={(e) => setRol(e.target.value)}><option value="Administrador">Administrador</option><option value="Operador">Operador</option><option value="Consulta">Consulta</option></select></div>
            <div className="form-field"><label htmlFor="estadoUsuario">Estado</label><select id="estadoUsuario" value={estado} onChange={(e) => setEstado(e.target.value)}><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secundario" onClick={limpiar} disabled={guardando}>Cancelar</button>
            <button type="submit" className="btn-primario" disabled={guardando}>{guardando ? 'Guardando...' : editando !== null ? 'Actualizar usuario' : 'Registrar usuario'}</button>
          </div>
          {errorForm && <p className="form-message error" role="alert">{errorForm}</p>}
        </form>
      </Modal>

      <section className="panel activity-panel">
        <div className="panel-header">
          <div><h3>Usuarios registrados</h3><p>Información consultada desde el servicio de autenticación.</p></div>
          <span className="product-count">{usuarios.length} usuarios</span>
        </div>
        {mensaje && <p className="form-message success" role="status">{mensaje}</p>}
        {errorForm && !modalOpen && <p className="form-message error" role="alert">{errorForm}</p>}
        {cargando ? <p className="catalog-message">Cargando usuarios...</p> : error ? <p className="catalog-error" role="alert">{error}</p> : usuarios.length === 0 ? <p className="catalog-message">No hay usuarios registrados.</p> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>USUARIO</th><th>CORREO</th><th>ROL</th><th>ESTADO</th><th>ACCIONES</th></tr></thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id_usuario}>
                    <td><strong>{u.nombre}</strong></td><td>{u.correo}</td><td>{u.rol}</td>
                    <td><span className={`status-badge ${u.estado === 'Activo' ? 'completed' : 'pending'}`}>{u.estado}</span></td>
                    <td><button type="button" className="btn-editar" onClick={() => prepararEdicion(u)}>Editar</button> <button type="button" className="btn-eliminar" onClick={() => desactivar(u.id_usuario)}>Desactivar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
