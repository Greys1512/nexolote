import { useEffect, useState } from 'react';
import { Factory, Plus } from 'lucide-react';
import { apiFetch } from '../../services/api';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import type { LoteProduccion } from '../../types/domain';
import { formatearFecha } from '../../utils/format';

export default function Produccion() {
  const [lotes, setLotes] = useState<LoteProduccion[]>([]);
  const [cargandoLotes, setCargandoLotes] = useState(true);
  const [errorLotes, setErrorLotes] = useState('');
  const [pagina, setPagina] = useState(1);
  const paginaSize = 10;
  const [modalProduccionOpen, setModalProduccionOpen] = useState(false);
  const [guardandoProduccion, setGuardandoProduccion] = useState(false);
  const [guardadoExitosoProduccion, setGuardadoExitosoProduccion] = useState(false);
  const [codigoLote, setCodigoLote] = useState('');
  const [idProductoLote, setIdProductoLote] = useState('');
  const [idResponsableLote, setIdResponsableLote] = useState('');
  const [fechaProduccionLote, setFechaProduccionLote] = useState('');
  const [fechaVencimientoLote, setFechaVencimientoLote] = useState('');
  const [cantidadProducidaLote, setCantidadProducidaLote] = useState('');
  const [estadoLote, setEstadoLote] = useState('Activo');
  const [productosActivosProduccion, setProductosActivosProduccion] = useState<{ id_producto: number; nombre: string }[]>([]);
  const [responsablesActivosProduccion, setResponsablesActivosProduccion] = useState<{ id_responsable: number; nombre_completo: string }[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const cargar = async () => {
      try {
        const [rLotes, rProd, rResp] = await Promise.all([
          apiFetch('/produccion/lotes', { signal: controller.signal }),
          apiFetch('/produccion/productos', { signal: controller.signal }),
          apiFetch('/produccion/responsables', { signal: controller.signal }),
        ]);
        if (!rLotes.ok) throw new Error('No se pudieron obtener los lotes de producción.');
        setLotes((await rLotes.json()) as LoteProduccion[]);
        setErrorLotes('');
        if (rProd.ok) setProductosActivosProduccion(await rProd.json());
        if (rResp.ok) setResponsablesActivosProduccion(await rResp.json());
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setErrorLotes(error instanceof Error ? error.message : 'Error al consultar los lotes.');
      } finally {
        if (!controller.signal.aborted) setCargandoLotes(false);
      }
    };
    void cargar();
    return () => controller.abort();
  }, []);

// =========================

const registrarLoteProduccion = async () => {
  setGuardandoProduccion(true);

  try {
    const respuesta = await apiFetch('/produccion/lotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_lote: codigoLote.trim(),
        id_producto: Number(idProductoLote),
        id_responsable: Number(idResponsableLote),
        fecha_produccion: fechaProduccionLote,
        fecha_vencimiento: fechaVencimientoLote || null,
        cantidad_producida: Number(cantidadProducidaLote),
        estado: estadoLote,
      }),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.message || 'No se pudo registrar el lote de producción.',
      );
    }

    setGuardadoExitosoProduccion(true);

    const consulta = await apiFetch('/produccion/lotes');
    if (!consulta.ok) {
      throw new Error('No se pudo actualizar la lista de lotes.');
    }
    const datos = await consulta.json();
    setLotes(datos);

    setTimeout(() => {
      setGuardadoExitosoProduccion(false);
      setModalProduccionOpen(false);
      limpiarFormularioProduccion();
    }, 1500);
  } catch (error) {
    setErrorLotes(
      error instanceof Error
        ? error.message
        : 'Ocurrió un error al registrar el lote.',
    );
  } finally {
    setGuardandoProduccion(false);
  }
};

const limpiarFormularioProduccion = () => {
  setCodigoLote('');
  setIdProductoLote('');
  setIdResponsableLote('');
  setFechaProduccionLote('');
  setFechaVencimientoLote('');
  setCantidadProducidaLote('');
  setEstadoLote('Activo');
};

// =========================

  return (
            <section className="catalog-page">

              <section className="welcome-section">
                <div>
                  <div className="eyebrow">
                    <Factory size={15} />
                    GESTIÓN DE PRODUCCIÓN
                  </div>

                  <h1>Producción</h1>

                  <p>
                    Control y seguimiento de los lotes de producción de NEXOLOTE.
                  </p>
                </div>

                <div className="page-actions">
                  <button
                    className="btn-primario"
                    onClick={() => {
                      limpiarFormularioProduccion();
                      setModalProduccionOpen(true);
                    }}
                  >
                    <Plus size={18} />
                    Agregar lote
                  </button>
                </div>
              </section>

              {/* Modal Producción */}
              <Modal
                open={modalProduccionOpen}
                onClose={() => setModalProduccionOpen(false)}
                titulo="Nuevo lote de producción"
                icono={Factory}
              >
                <form onSubmit={(e) => {
                  e.preventDefault();
                  registrarLoteProduccion();
                }}>
                  <div className="form-field">
                    <label>Código de lote</label>
                    <input
                      type="text"
                      value={codigoLote}
                      onChange={(e) => setCodigoLote(e.target.value)}
                      placeholder="Ej. LP-2026-001"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Producto</label>
                    <select
                      value={idProductoLote}
                      onChange={(e) => setIdProductoLote(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {productosActivosProduccion.map((p) => (
                        <option key={p.id_producto} value={p.id_producto}>
                          {p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Responsable</label>
                    <select
                      value={idResponsableLote}
                      onChange={(e) => setIdResponsableLote(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar responsable</option>
                      {responsablesActivosProduccion.map((r) => (
                        <option key={r.id_responsable} value={r.id_responsable}>
                          {r.nombre_completo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Fecha de producción</label>
                      <input
                        type="date"
                        value={fechaProduccionLote}
                        onChange={(e) => setFechaProduccionLote(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Fecha de vencimiento</label>
                      <input
                        type="date"
                        value={fechaVencimientoLote}
                        onChange={(e) => setFechaVencimientoLote(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label>Cantidad producida</label>
                      <input
                        type="number"
                        value={cantidadProducidaLote}
                        onChange={(e) => setCantidadProducidaLote(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Estado</label>
                      <select
                        value={estadoLote}
                        onChange={(e) => setEstadoLote(e.target.value)}
                      >
                        <option value="Activo">Activo</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <button
                      type="button"
                      className="btn-secundario"
                      onClick={() => setModalProduccionOpen(false)}
                      disabled={guardandoProduccion}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-primario"
                      disabled={guardandoProduccion}
                    >
                      {guardandoProduccion ? 'Guardando...' : 'Registrar lote'}
                    </button>
                  </div>
                </form>
              </Modal>

              {guardadoExitosoProduccion && (
                <div className="alert-success">
                  Lote de producción registrado correctamente.
                </div>
              )}

              <section className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <h3>Lotes de producción</h3>
                    <p>Información obtenida desde la base de datos.</p>
                  </div>

                  <span className="product-count">
                    {lotes.length} lotes registrados
                  </span>
                </div>

                {cargandoLotes ? (
                  <p className="catalog-message">Cargando lotes de producción...</p>
                ) : errorLotes ? (
                  <p className="catalog-error">{errorLotes}</p>
                ) : lotes.length === 0 ? (
                  <p className="catalog-message">
                    No hay lotes de producción registrados.
                  </p>
                ) : (
                  <>
                    <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>CÓDIGO</th>
                          <th>PRODUCTO</th>
                          <th>RESPONSABLE</th>
                          <th>FECHA PRODUCCIÓN</th>
                          <th>VENCIMIENTO</th>
                          <th>CANTIDAD</th>
                          <th>ESTADO</th>
                        </tr>
                      </thead>

                      <tbody>
                        {lotes.slice((pagina - 1) * paginaSize, pagina * paginaSize).map((lote) => (
                          <tr key={lote.id_lote}>
                            <td className="reference">{lote.codigo_lote}</td>

                            <td>
                              <strong>{lote.producto_nombre}</strong>
                            </td>

                            <td>{lote.responsable_nombre}</td>

                            <td>{formatearFecha(lote.fecha_produccion)}</td>

                            <td>{formatearFecha(lote.fecha_vencimiento)}</td>

                            <td>{lote.cantidad_producida}</td>

                            <td>
                              <span className="status-badge processing">
                                {lote.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                                      <Pagination page={pagina} total={lotes.length} pageSize={paginaSize} onPageChange={setPagina} />
                  </>

                )}
              </section>

            </section>

  );
}
