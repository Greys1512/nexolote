import { useEffect, useState } from 'react';
import { Activity, ClipboardList, Clock, Plus, Wrench } from 'lucide-react';
import { apiFetch } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import type { EquipoMantenimiento, IncidenciaMantenimiento, MantenimientoRegistro, ResponsableMantenimiento } from '../../types/domain';
import { formatearFecha, formatearMoneda } from '../../utils/format';

export default function Mantenimiento() {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoRegistro[]>([]);
  const [cargandoMantenimientos, setCargandoMantenimientos] = useState(true);
  const [errorMantenimientos, setErrorMantenimientos] = useState('');
  const [paginaMant, setPaginaMant] = useState(1);
  const paginaMantSize = 10;
  const [paginaResponsables, setPaginaResponsables] = useState(1);
  const paginaResponsablesSize = 10;
  const [paginaIncidencias, setPaginaIncidencias] = useState(1);
  const paginaIncidenciasSize = 10;
  const [equiposMantenimiento, setEquiposMantenimiento] = useState<EquipoMantenimiento[]>([]);
  const [responsablesMantenimiento, setResponsablesMantenimiento] = useState<ResponsableMantenimiento[]>([]);
  const [cargandoResponsables, setCargandoResponsables] = useState(true);
  const [errorResponsables, setErrorResponsables] = useState('');
  const [incidencias, setIncidencias] = useState<IncidenciaMantenimiento[]>([]);
  const [cargandoIncidencias, setCargandoIncidencias] = useState(true);
  const [errorIncidencias, setErrorIncidencias] = useState('');
  const [modalMantenimientoOpen, setModalMantenimientoOpen] = useState(false);
  const [guardandoMantenimiento, setGuardandoMantenimiento] = useState(false);
  const [guardadoExitosoMantenimiento, setGuardadoExitosoMantenimiento] = useState(false);
  const [idEquipoMantenimiento, setIdEquipoMantenimiento] = useState('');
  const [idResponsableMantenimiento, setIdResponsableMantenimiento] = useState('');
  const [fechaProgramadaMantenimiento, setFechaProgramadaMantenimiento] = useState('');
  const [tipoMantenimiento, setTipoMantenimiento] = useState('');
  const [descripcionMantenimiento, setDescripcionMantenimiento] = useState('');
  const [costoMantenimiento, setCostoMantenimiento] = useState('');
  const [estadoMantenimiento, setEstadoMantenimiento] = useState('Programado');
  const [equiposParaMantenimiento, setEquiposParaMantenimiento] = useState<{ id_equipo: number; nombre: string; codigo_inventario: string }[]>([]);
  const [responsablesParaMantenimiento, setResponsablesParaMantenimiento] = useState<{ id_responsable: number; nombre_completo: string }[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const consultar = async <T,>(ruta: string): Promise<T> => {
      const respuesta = await apiFetch(ruta, { signal: controller.signal });
      if (!respuesta.ok) throw new Error('No se pudieron consultar los datos de ' + ruta + '.');
      return (await respuesta.json()) as T;
    };
    const manejarError = (error: unknown, setErr: (m: string) => void) => {
      if (controller.signal.aborted) return;
      setErr(error instanceof Error ? error.message : 'Ocurrió un error al consultar los datos.');
    };
    void Promise.all([
      consultar<MantenimientoRegistro[]>('/mantenimiento/registros').then((d) => { setMantenimientos(d); setErrorMantenimientos(''); }).catch((e) => manejarError(e, setErrorMantenimientos)).finally(() => { if (!controller.signal.aborted) setCargandoMantenimientos(false); }),
      consultar<EquipoMantenimiento[]>('/mantenimiento/equipos').then((d) => { setEquiposMantenimiento(d); setEquiposParaMantenimiento(d.map(x => ({ id_equipo: x.id_equipo, nombre: x.nombre, codigo_inventario: x.codigo_inventario }))); }).catch(() => {}),
      consultar<ResponsableMantenimiento[]>('/mantenimiento/responsables').then((d) => { setResponsablesMantenimiento(d); setErrorResponsables(''); setResponsablesParaMantenimiento(d.map(r => ({ id_responsable: r.id_responsable, nombre_completo: r.nombres + ' ' + r.apellidos }))); }).catch((e) => manejarError(e, setErrorResponsables)).finally(() => { if (!controller.signal.aborted) setCargandoResponsables(false); }),
      consultar<IncidenciaMantenimiento[]>('/mantenimiento/incidencias').then((d) => { setIncidencias(d); setErrorIncidencias(''); }).catch((e) => manejarError(e, setErrorIncidencias)).finally(() => { if (!controller.signal.aborted) setCargandoIncidencias(false); }),
    ]);
    return () => controller.abort();
  }, []);

// =========================

const registrarMantenimiento = async () => {
  setGuardandoMantenimiento(true);

  try {
    const respuesta = await apiFetch('/mantenimiento/registros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_equipo: Number(idEquipoMantenimiento),
        id_responsable: Number(idResponsableMantenimiento),
        fecha_programada: fechaProgramadaMantenimiento,
        tipo_mantenimiento: tipoMantenimiento,
        descripcion: descripcionMantenimiento || undefined,
        costo: costoMantenimiento ? Number(costoMantenimiento) : null,
        estado: estadoMantenimiento,
      }),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || 'No se pudo registrar el mantenimiento.',
      );
    }

    setGuardadoExitosoMantenimiento(true);

    const consulta = await apiFetch('/mantenimiento/registros');
    if (!consulta.ok) {
      throw new Error('No se pudo actualizar la lista de mantenimientos.');
    }
    const datos = await consulta.json();
    setMantenimientos(datos);

    setTimeout(() => {
      setGuardadoExitosoMantenimiento(false);
      setModalMantenimientoOpen(false);
      limpiarFormularioMantenimiento();
    }, 1500);
  } catch (error) {
    setErrorMantenimientos(
      error instanceof Error
        ? error.message
        : 'Ocurrió un error al registrar el mantenimiento.',
    );
  } finally {
    setGuardandoMantenimiento(false);
  }
};

const limpiarFormularioMantenimiento = () => {
  setIdEquipoMantenimiento('');
  setIdResponsableMantenimiento('');
  setFechaProgramadaMantenimiento('');
  setTipoMantenimiento('');
  setDescripcionMantenimiento('');
  setCostoMantenimiento('');
  setEstadoMantenimiento('Programado');
};

// =========================

  return (
            <section className="catalog-page">

              <section className="welcome-section">
                <div>
                  <div className="eyebrow">
                    <Wrench size={15} />
                    GESTIÓN DE MANTENIMIENTO
                  </div>

                  <h1>Centro de mantenimiento</h1>

                  <p>
                    Consulta los mantenimientos, equipos, responsables e incidencias de NEXOLOTE.
                  </p>
                </div>

                <div className="page-actions">
                  <button
                    className="btn-primario"
                    onClick={() => {
                      limpiarFormularioMantenimiento();
                      setModalMantenimientoOpen(true);
                    }}
                  >
                    <Plus size={18} />
                    Agregar mantenimiento
                  </button>
                </div>
              </section>

              {/* Modal Mantenimiento */}
              <Modal
                open={modalMantenimientoOpen}
                onClose={() => setModalMantenimientoOpen(false)}
                titulo="Nuevo registro de mantenimiento"
                icono={Wrench}
              >
                <form onSubmit={(e) => {
                  e.preventDefault();
                  registrarMantenimiento();
                }}>
                  <div className="form-field">
                    <label>Equipo</label>
                    <select
                      value={idEquipoMantenimiento}
                      onChange={(e) => setIdEquipoMantenimiento(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar equipo</option>
                      {equiposParaMantenimiento.map((e) => (
                        <option key={e.id_equipo} value={e.id_equipo}>
                          {e.nombre} ({e.codigo_inventario})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Responsable</label>
                    <select
                      value={idResponsableMantenimiento}
                      onChange={(e) => setIdResponsableMantenimiento(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar responsable</option>
                      {responsablesParaMantenimiento.map((r) => (
                        <option key={r.id_responsable} value={r.id_responsable}>
                          {r.nombre_completo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Fecha programada</label>
                      <input
                        type="date"
                        value={fechaProgramadaMantenimiento}
                        onChange={(e) => setFechaProgramadaMantenimiento(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Tipo de mantenimiento</label>
                      <input
                        type="text"
                        value={tipoMantenimiento}
                        onChange={(e) => setTipoMantenimiento(e.target.value)}
                        placeholder="Ej. Preventivo, Correctivo"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Descripción</label>
                    <textarea
                      value={descripcionMantenimiento}
                      onChange={(e) => setDescripcionMantenimiento(e.target.value)}
                      rows={3}
                      placeholder="Describir actividades..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Costo</label>
                      <input
                        type="number"
                        value={costoMantenimiento}
                        onChange={(e) => setCostoMantenimiento(e.target.value)}
                        placeholder="0"
                      />
                    </div>

                    <div className="form-field">
                      <label>Estado</label>
                      <select
                        value={estadoMantenimiento}
                        onChange={(e) => setEstadoMantenimiento(e.target.value)}
                      >
                        <option value="Programado">Programado</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Realizado">Realizado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <button
                      type="button"
                      className="btn-secundario"
                      onClick={() => setModalMantenimientoOpen(false)}
                      disabled={guardandoMantenimiento}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primario"
                      disabled={guardandoMantenimiento}
                    >
                      {guardandoMantenimiento ? 'Guardando...' : 'Registrar mantenimiento'}
                    </button>
                  </div>
                </form>
              </Modal>

              {guardadoExitosoMantenimiento && (
                <div className="alert-success">
                  Mantenimiento registrado correctamente.
                </div>
              )}

              {/* INDICADORES */}
              <section className="stats-grid">
                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon blue">
                      <ClipboardList size={22} />
                    </div>
                  </div>

                  <div className="stat-value">
                    {mantenimientos.length}
                  </div>

                  <div className="stat-title">Mantenimientos</div>
                  <div className="stat-change">Registros totales</div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon orange">
                      <Clock size={22} />
                    </div>
                  </div>

                  <div className="stat-value">
                    {mantenimientos.filter(
                      (m) => m.estado?.toLowerCase() === 'pendiente',
                    ).length}
                  </div>

                  <div className="stat-title">Pendientes</div>
                  <div className="stat-change">Por realizar</div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon green">
                      <Activity size={22} />
                    </div>
                  </div>

                  <div className="stat-value">
                    {mantenimientos.filter(
                      (m) => m.estado?.toLowerCase() === 'realizado',
                    ).length}
                  </div>

                  <div className="stat-title">Realizados</div>
                  <div className="stat-change">Completados</div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <div className="stat-icon purple">
                      <Wrench size={22} />
                    </div>
                  </div>

                  <div className="stat-value">
                    {equiposMantenimiento.length}
                  </div>

                  <div className="stat-title">Equipos activos</div>
                  <div className="stat-change">En el sistema</div>
                </article>
              </section>

              {/* MANTENIMIENTOS */}
              <section className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <h3>Programación de mantenimientos</h3>
                    <p>
                      Seguimiento de las actividades programadas y realizadas.
                    </p>
                  </div>

                  <span className="product-count">
                    {mantenimientos.length} registros
                  </span>
                </div>

                {cargandoMantenimientos ? (
                  <p className="catalog-message">
                    Cargando mantenimientos...
                  </p>
                ) : errorMantenimientos ? (
                  <p className="catalog-error">
                    {errorMantenimientos}
                  </p>
                ) : mantenimientos.length === 0 ? (
                  <p className="catalog-message">
                    No hay mantenimientos registrados.
                  </p>
                ) : (
                  <>
                    <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>REFERENCIA</th>
                          <th>EQUIPO</th>
                          <th>RESPONSABLE</th>
                          <th>TIPO</th>
                          <th>FECHA PROGRAMADA</th>
                          <th>FECHA REALIZACIÓN</th>
                          <th>COSTO</th>
                          <th>ESTADO</th>
                        </tr>
                      </thead>

                      <tbody>
                        {mantenimientos.slice((paginaMant - 1) * paginaMantSize, paginaMant * paginaMantSize).map((mantenimiento) => (
                          <tr key={mantenimiento.id_mantenimiento}>
                            <td className="reference">
                              MNT-{String(mantenimiento.id_mantenimiento).padStart(3, '0')}
                            </td>

                            <td>
                              <strong>{mantenimiento.nombre_equipo}</strong>
                              <br />
                              <small>{mantenimiento.codigo_inventario}</small>
                            </td>

                            <td>{mantenimiento.nombre_responsable}</td>

                            <td>{mantenimiento.tipo_mantenimiento}</td>

                            <td>{formatearFecha(mantenimiento.fecha_programada)}</td>

                            <td>
                              {mantenimiento.fecha_realizacion
                                ? formatearFecha(mantenimiento.fecha_realizacion)
                                : 'Pendiente'}
                            </td>

                            <td>{formatearMoneda(mantenimiento.costo)}</td>

                            <td>
                              <span
                                className={`status-badge ${
                                  mantenimiento.estado?.toLowerCase() === 'realizado'
                                    ? 'completed'
                                    : mantenimiento.estado?.toLowerCase() === 'pendiente'
                                      ? 'pending'
                                      : 'processing'
                                }`}
                              >
                                {mantenimiento.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                                      <Pagination page={paginaMant} total={mantenimientos.length} pageSize={paginaMantSize} onPageChange={setPaginaMant} />
                  </>

                )}
              </section>

              {/* RESPONSABLES */}
              <section className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <h3>Personal responsable</h3>
                    <p>
                      Responsables activos de las actividades de mantenimiento.
                    </p>
                  </div>

                  <span className="product-count">
                    {responsablesMantenimiento.length} responsables
                  </span>
                </div>

                {cargandoResponsables ? (
                  <p className="catalog-message">Cargando responsables...</p>
                ) : errorResponsables ? (
                  <p className="catalog-error">{errorResponsables}</p>
                ) : responsablesMantenimiento.length === 0 ? (
                  <p className="catalog-message">
                    No hay responsables activos.
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>RESPONSABLE</th>
                          <th>CARGO</th>
                          <th>TELÉFONO</th>
                          <th>CORREO</th>
                          <th>ESTADO</th>
                        </tr>
                      </thead>

                      <tbody>
                        {responsablesMantenimiento
                          .slice((paginaResponsables - 1) * paginaResponsablesSize, paginaResponsables * paginaResponsablesSize)
                          .map((responsable) => (
                          <tr key={responsable.id_responsable}>
                            <td>
                              <strong>
                                {responsable.nombres} {responsable.apellidos}
                              </strong>
                            </td>

                            <td>{responsable.cargo || 'No definido'}</td>
                            <td>{responsable.telefono || 'No registrado'}</td>
                            <td>{responsable.correo || 'No registrado'}</td>

                            <td>
                              <span className="status-badge completed">
                                {responsable.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  <Pagination page={paginaResponsables} total={responsablesMantenimiento.length} pageSize={paginaResponsablesSize} onPageChange={setPaginaResponsables} />
                  </div>
                )}
              </section>

              {/* INCIDENCIES */}
              <section className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <h3>Incidencias de producción</h3>
                    <p>
                      Novedades relacionadas con los lotes de producción.
                    </p>
                  </div>

                  <span className="product-count">
                    {incidencias.length} incidencias
                  </span>
                </div>

                {cargandoIncidencias ? (
                  <p className="catalog-message">Cargando incidencias...</p>
                ) : errorIncidencias ? (
                  <p className="catalog-error">{errorIncidencias}</p>
                ) : incidencias.length === 0 ? (
                  <p className="catalog-message">
                    No hay incidencias registradas.
                  </p>
                ) : (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>REFERENCIA</th>
                          <th>LOTE</th>
                          <th>PRODUCTO</th>
                          <th>TIPO</th>
                          <th>RESPONSABLE</th>
                          <th>FECHA</th>
                          <th>DESCRIPCIÓN</th>
                          <th>ESTADO</th>
                        </tr>
                      </thead>

                      <tbody>
                        {incidencias.map((incidencia) => (
                          <tr key={incidencia.id_incidencia}>
                            <td className="reference">
                              INC-{String(incidencia.id_incidencia).padStart(3, '0')}
                            </td>

                            <td>{incidencia.codigo_lote}</td>

                            <td>
                              <strong>{incidencia.nombre_producto}</strong>
                            </td>

                            <td>{incidencia.tipo_incidencia}</td>

                            <td>
                              {incidencia.nombre_responsable || 'Sin asignar'}
                            </td>

                            <td>{formatearFecha(incidencia.fecha_registro)}</td>

                            <td>
                              {incidencia.descripcion || 'Sin descripción'}
                            </td>

                            <td>
                              <span
                                className={`status-badge ${
                                  incidencia.estado?.toLowerCase() === 'resuelta'
                                    ? 'completed'
                                    : incidencia.estado?.toLowerCase() === 'pendiente'
                                      ? 'pending'
                                      : 'processing'
                                }`}
                              >
                                {incidencia.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  <Pagination page={paginaIncidencias} total={incidencias.length} pageSize={paginaIncidenciasSize} onPageChange={setPaginaIncidencias} />
                  </div>
                )}
              </section>

            </section>

  );
}
