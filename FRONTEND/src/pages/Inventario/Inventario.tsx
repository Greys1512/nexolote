
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Boxes,
  Package,
  AlertTriangle,
  CalendarX,
  CheckCircle2,
  Search,
  RefreshCw,
  TrendingDown,
  ArrowDownToLine,
  Activity,
  Clock,
  ShieldAlert,
} from 'lucide-react';

import { apiFetch } from '../../services/api';

import Modal from '../../components/common/Modal';
import './Inventario.css';

interface DashboardInventario {
  total_materias_primas: number;
  total_lotes: number;
  lotes_vencidos: number;
  lotes_por_vencer: number;
  materias_primas_stock_bajo: number;
  total_consumos: number;
}

interface MateriaPrima {
  id_materia_prima: number;
  nombre: string;
  descripcion: string | null;
  unidad_medida: string;
  stock_minimo: number | string | null;
  estado: string;
  cantidad_recibida: number | string;
  cantidad_utilizada: number | string;
  cantidad_disponible: number | string;
}

interface LoteMateriaPrima {
  id_lote_mp: number;
  codigo_lote_mp: string;
  id_materia_prima: number;
  materia_prima_nombre: string;
  id_proveedor: number;
  proveedor_nombre: string;
  id_ubicacion: number;
  fecha_recepcion: string;
  fecha_vencimiento: string | null;
  cantidad_recibida: number | string;
  estado: string;
}

type FiltroLotes = 'Todos' | 'Vencidos' | 'Por vencer' | 'Vigentes';

function numero(valor: number | string | null | undefined): number {
  const resultado = Number(valor ?? 0);
  return Number.isFinite(resultado) ? resultado : 0;
}

function fechaLocal(fecha: string | null): Date | null {
  if (!fecha) return null;

  const fechaCorta = fecha.substring(0, 10);
  const partes = fechaCorta.split('-').map(Number);

  if (partes.length !== 3 || partes.some(Number.isNaN)) return null;

  return new Date(partes[0], partes[1] - 1, partes[2]);
}

function diasHastaVencimiento(fecha: string | null): number | null {
  const vencimiento = fechaLocal(fecha);
  if (!vencimiento) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diferencia = vencimiento.getTime() - hoy.getTime();

  return Math.round(diferencia / (1000 * 60 * 60 * 24));
}

function formatearFecha(fecha: string | null): string {
  const valor = fechaLocal(fecha);

  if (!valor) return 'Sin fecha';

  return valor.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatearCantidad(valor: number | string | null): string {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2,
  }).format(numero(valor));
}

function clasificarLote(fecha: string | null) {
  const dias = diasHastaVencimiento(fecha);

  if (dias === null) {
    return {
      texto: 'Sin vencimiento',
      clase: 'sin-fecha',
    };
  }

  if (dias < 0) {
    return {
      texto: 'Vencido',
      clase: 'vencido',
    };
  }

  if (dias <= 30) {
    return {
      texto: dias === 0 ? 'Vence hoy' : `Vence en ${dias} días`,
      clase: 'por-vencer',
    };
  }

  return {
    texto: 'Vigente',
    clase: 'vigente',
  };
}

export default function Inventario() {
  const [dashboard, setDashboard] = useState<DashboardInventario | null>(null);

  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [lotes, setLotes] = useState<LoteMateriaPrima[]>([]);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const [busquedaMaterias, setBusquedaMaterias] = useState('');
  const [busquedaLotes, setBusquedaLotes] = useState('');
  const [filtroLotes, setFiltroLotes] = useState<FiltroLotes>('Todos');

  // <Plus size={17} /> Registrar entrada
  const [modalInventarioOpen, setModalInventarioOpen] = useState(false);
  const [guardandoInventario, setGuardandoInventario] = useState(false);
  const [guardadoExitosoInventario, setGuardadoExitosoInventario] = useState(false);
  const [idMateriaPrimaEntrada, setIdMateriaPrimaEntrada] = useState('');
  const [idProveedorEntrada, setIdProveedorEntrada] = useState('');
  const [idUbicacionEntrada, setIdUbicacionEntrada] = useState('');
  const [fechaRecepcionEntrada, setFechaRecepcionEntrada] = useState('');
  const [fechaVencimientoEntrada, setFechaVencimientoEntrada] = useState('');
  const [cantidadRecibidaEntrada, setCantidadRecibidaEntrada] = useState('');
  const [materiasPrimasParaEntrada, setMateriasPrimasParaEntrada] = useState<{ id_materia_prima: number; nombre: string }[]>([]);
  const [proveedoresParaEntrada, setProveedoresParaEntrada] = useState<{ id_proveedor: number; nombre: string }[]>([]);
  const [ubicacionesParaEntrada, setUbicacionesParaEntrada] = useState<{ id_ubicacion: number; nombre: string }[]>([]);

  const cargarCatalogosEntrada = async () => {
    try {
      const [rM, rP, rU] = await Promise.all([
        apiFetch('/inventario/materias-primas'),
        apiFetch('/inventario/proveedores'),
        apiFetch('/inventario/ubicaciones'),
      ]);
      if (rM.ok) setMateriasPrimasParaEntrada(await rM.json());
      if (rP.ok) setProveedoresParaEntrada(await rP.json());
      if (rU.ok) setUbicacionesParaEntrada(await rU.json());
    } catch { /* no crítico */ }
  };

  const cargarInventario = async (esActualizacion = false) => {
    if (esActualizacion) {
      setActualizando(true);
    } else {
      setCargando(true);
    }

    setError('');

    try {
      const [respuestaDashboard, respuestaMaterias, respuestaLotes] =
        await Promise.all([
          apiFetch('/inventario/dashboard'),
          apiFetch('/inventario/materias-primas'),
          apiFetch('/inventario/lotes-materia-prima'),
        ]);

      if (!respuestaDashboard.ok) {
        throw new Error('No se pudo consultar el resumen del inventario.');
      }

      if (!respuestaMaterias.ok) {
        throw new Error('No se pudieron consultar las materias primas.');
      }

      if (!respuestaLotes.ok) {
        throw new Error('No se pudieron consultar los lotes de materias primas.');
      }

      const [datosDashboard, datosMaterias, datosLotes] = await Promise.all([
        respuestaDashboard.json(),
        respuestaMaterias.json(),
        respuestaLotes.json(),
      ]);

      setDashboard(datosDashboard);
      setMateriasPrimas(datosMaterias);
      setLotes(datosLotes);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al cargar el inventario.',
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
  const ejecutarCarga = async () => {
    await cargarInventario();
  };

  void ejecutarCarga();
}, []);

  const limpiarFormularioInventario = () => {
    setIdMateriaPrimaEntrada('');
    setIdProveedorEntrada('');
    setIdUbicacionEntrada('');
    setFechaRecepcionEntrada('');
    setFechaVencimientoEntrada('');
    setCantidadRecibidaEntrada('');
  };

  const registrarEntradaInventario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardandoInventario(true);
    setError('');
    try {
      const respuesta = await apiFetch('/inventario/entrada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_materia_prima: Number(idMateriaPrimaEntrada),
          id_proveedor: Number(idProveedorEntrada),
          id_ubicacion: Number(idUbicacionEntrada),
          fecha_recepcion: fechaRecepcionEntrada,
          fecha_vencimiento: fechaVencimientoEntrada || null,
          cantidad_recibida: Number(cantidadRecibidaEntrada),
        }),
      });
      const resultado = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) throw new Error((resultado as { message?: string }).message || 'No se pudo registrar la entrada.');
      setGuardadoExitosoInventario(true);
      await cargarInventario(true);
      setTimeout(() => {
        setGuardadoExitosoInventario(false);
        setModalInventarioOpen(false);
        limpiarFormularioInventario();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al registrar la entrada.');
    } finally {
      setGuardandoInventario(false);
    }
  };

  const materiasFiltradas = useMemo(() => {
    const termino = busquedaMaterias.trim().toLowerCase();

    return materiasPrimas.filter((materia) =>
      materia.nombre.toLowerCase().includes(termino),
    );
  }, [materiasPrimas, busquedaMaterias]);

  const lotesFiltrados = useMemo(() => {
    const termino = busquedaLotes.trim().toLowerCase();

    return lotes.filter((lote) => {
      const coincideBusqueda =
        lote.codigo_lote_mp.toLowerCase().includes(termino) ||
        lote.materia_prima_nombre.toLowerCase().includes(termino) ||
        lote.proveedor_nombre.toLowerCase().includes(termino);

      const dias = diasHastaVencimiento(lote.fecha_vencimiento);

      let coincideFiltro = true;

      if (filtroLotes === 'Vencidos') {
        coincideFiltro = dias !== null && dias < 0;
      } else if (filtroLotes === 'Por vencer') {
        coincideFiltro = dias !== null && dias >= 0 && dias <= 30;
      } else if (filtroLotes === 'Vigentes') {
        coincideFiltro = dias !== null && dias > 30;
      }

      return coincideBusqueda && coincideFiltro;
    });
  }, [lotes, busquedaLotes, filtroLotes]);

  const alertas = useMemo(() => {
    return lotes
      .map((lote) => ({
        ...lote,
        dias: diasHastaVencimiento(lote.fecha_vencimiento),
      }))
      .filter((lote) => lote.dias !== null && lote.dias <= 30)
      .sort((a, b) => (a.dias ?? 9999) - (b.dias ?? 9999));
  }, [lotes]);

  const materiasStockBajo = materiasPrimas.filter(
    (materia) =>
      numero(materia.cantidad_disponible) <= numero(materia.stock_minimo),
  );

  if (cargando) {
    return (
      <section className="inventory-loading">
        <div className="inventory-loading-icon">
          <Boxes size={30} />
        </div>
        <h2>Preparando inventario</h2>
        <p>Consultando materias primas, lotes y existencias...</p>
      </section>
    );
  }

  return (
    <section className="inventory-page">
      {/* ENCABEZADO */}
      <header className="inventory-welcome">
        <div>
          <div className="inventory-eyebrow">
            <Boxes size={16} />
            CENTRO DE CONTROL · INVENTARIOS
          </div>

          <h1>Gestión de inventario</h1>

          <p>
            Supervisa existencias, controla materias primas y anticipa
            vencimientos desde un solo lugar.
          </p>
        </div>

        <button
          className="inventory-refresh"
          onClick={() => { void cargarCatalogosEntrada(); void cargarInventario(true); }}
          disabled={actualizando}
        >
          <RefreshCw
            size={17}
            className={actualizando ? 'inventory-spinning' : ''}
          />
          {actualizando ? 'Actualizando...' : 'Actualizar datos'}
        </button>
      </header>

      {error && (
        <div className="inventory-error">
          <AlertTriangle size={19} />
          <span>{error}</span>
          <button onClick={() => void cargarInventario(true)}>
            Reintentar
          </button>
        </div>
      )}

      {guardadoExitosoInventario && (
        <div className="inventory-success" role="status">Entrada de materia prima registrada correctamente.</div>
      )}

      {/* INDICADORES */}
      <section className="inventory-stats">
        <article className="inventory-stat-card">
          <div className="inventory-stat-top">
            <div className="inventory-stat-icon blue">
              <Package size={22} />
            </div>
            <span className="inventory-stat-label">REGISTROS</span>
          </div>
          <strong>{dashboard?.total_materias_primas ?? 0}</strong>
          <h3>Materias primas</h3>
          <p>Referencias registradas</p>
        </article>

        <article className="inventory-stat-card">
          <div className="inventory-stat-top">
            <div className="inventory-stat-icon purple">
              <Boxes size={22} />
            </div>
            <span className="inventory-stat-label">RECEPCIONES</span>
          </div>
          <strong>{dashboard?.total_lotes ?? 0}</strong>
          <h3>Lotes registrados</h3>
          <p>Entradas de materias primas</p>
        </article>

        <article className="inventory-stat-card warning">
          <div className="inventory-stat-top">
            <div className="inventory-stat-icon orange">
              <AlertTriangle size={22} />
            </div>
            <span className="inventory-stat-label">ATENCIÓN</span>
          </div>
          <strong>{dashboard?.lotes_por_vencer ?? 0}</strong>
          <h3>Próximos a vencer</h3>
          <p>Dentro de los próximos 30 días</p>
        </article>

        <article className="inventory-stat-card danger">
          <div className="inventory-stat-top">
            <div className="inventory-stat-icon red">
              <CalendarX size={22} />
            </div>
            <span className="inventory-stat-label">CRÍTICO</span>
          </div>
          <strong>{dashboard?.lotes_vencidos ?? 0}</strong>
          <h3>Lotes vencidos</h3>
          <p>Requieren revisión</p>
        </article>

        <article className="inventory-stat-card">
          <div className="inventory-stat-top">
            <div className="inventory-stat-icon green">
              <CheckCircle2 size={22} />
            </div>
            <span className="inventory-stat-label">EXISTENCIAS</span>
          </div>
          <strong>{dashboard?.materias_primas_stock_bajo ?? 0}</strong>
          <h3>Stock bajo</h3>
          <p>Materias en nivel mínimo o inferior</p>
        </article>

        <article className="inventory-stat-card">
          <div className="inventory-stat-top">
            <div className="inventory-stat-icon teal">
              <Activity size={22} />
            </div>
            <span className="inventory-stat-label">PRODUCCIÓN</span>
          </div>
          <strong>{dashboard?.total_consumos ?? 0}</strong>
          <h3>Consumos registrados</h3>
          <p>Registros de utilización</p>
        </article>
      </section>

      {/* ALERTAS */}
      <section className="inventory-panel inventory-alert-panel">
        <div className="inventory-section-heading">
          <div className="inventory-heading-icon alert-heading-icon">
            <ShieldAlert size={21} />
          </div>

          <div>
            <h2>Centro de alertas</h2>
            <p>Control preventivo de vencimientos de materias primas.</p>
          </div>

          <span className="inventory-heading-count">
            {alertas.length} alertas
          </span>
        </div>

        {alertas.length === 0 ? (
          <div className="inventory-empty">
            <CheckCircle2 size={25} />
            <div>
              <strong>Sin alertas de vencimiento</strong>
              <p>No hay lotes vencidos ni próximos a vencer.</p>
            </div>
          </div>
        ) : (
          <div className="inventory-alert-list">
            {alertas.map((lote) => {
              const estado = clasificarLote(lote.fecha_vencimiento);

              return (
                <article className="inventory-alert-item" key={lote.id_lote_mp}>
                  <div className={`inventory-alert-symbol ${estado.clase}`}>
                    {estado.clase === 'vencido' ? (
                      <CalendarX size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>

                  <div className="inventory-alert-info">
                    <strong>{lote.materia_prima_nombre}</strong>
                    <span>
                      {lote.codigo_lote_mp} · {lote.proveedor_nombre}
                    </span>
                  </div>

                  <div className="inventory-alert-date">
                    <strong>{formatearFecha(lote.fecha_vencimiento)}</strong>
                    <span>{estado.texto}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* EXISTENCIAS */}
      <section className="inventory-panel">
        <div className="inventory-section-heading">
          <div className="inventory-heading-icon stock-heading-icon">
            <TrendingDown size={21} />
          </div>

          <div>
            <h2>Existencias por materia prima</h2>
            <p>Entradas, consumos y disponibilidad calculada.</p>
          </div>

          <span className="inventory-heading-count">
            {materiasPrimas.length} referencias
          </span>
        </div>

        {materiasStockBajo.length > 0 && (
          <div className="inventory-stock-warning">
            <AlertTriangle size={18} />
            <span>
              Hay {materiasStockBajo.length} materias primas en su stock mínimo
              o por debajo de él.
            </span>
          </div>
        )}

        <div className="inventory-toolbar">
          <div className="inventory-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Buscar materia prima..."
              value={busquedaMaterias}
              onChange={(e) => setBusquedaMaterias(e.target.value)}
            />
          </div>
          <span>{materiasFiltradas.length} resultados</span>
        </div>

        {materiasPrimas.length === 0 ? (
          <div className="inventory-empty">
            No hay materias primas registradas.
          </div>
        ) : materiasFiltradas.length === 0 ? (
          <div className="inventory-empty">
            No se encontraron materias primas con esa búsqueda.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>MATERIA PRIMA</th>
                  <th>UNIDAD</th>
                  <th>STOCK MÍNIMO</th>
                  <th>RECIBIDO</th>
                  <th>UTILIZADO</th>
                  <th>DISPONIBLE</th>
                  <th>NIVEL DE STOCK</th>
                  <th>ESTADO</th>
                </tr>
              </thead>

              <tbody>
                {materiasFiltradas.map((materia) => {
                  const disponible = numero(materia.cantidad_disponible);
                  const minimo = numero(materia.stock_minimo);
                  const porcentaje =
                    minimo > 0
                      ? Math.min((disponible / (minimo * 2)) * 100, 100)
                      : 100;

                  const stockBajo = disponible <= minimo;

                  return (
                    <tr key={materia.id_materia_prima}>
                      <td>
                        <strong>{materia.nombre}</strong>
                        <small>
                          {materia.descripcion || 'Materia prima'}
                        </small>
                      </td>

                      <td>{materia.unidad_medida}</td>

                      <td>{formatearCantidad(materia.stock_minimo)}</td>

                      <td>{formatearCantidad(materia.cantidad_recibida)}</td>

                      <td>{formatearCantidad(materia.cantidad_utilizada)}</td>

                      <td>
                        <strong className={stockBajo ? 'inventory-low-number' : 'inventory-good-number'}>
                          {formatearCantidad(materia.cantidad_disponible)}
                        </strong>
                      </td>

                      <td>
                        <div className="inventory-stock-progress">
                          <div className="inventory-progress-track">
                            <div
                              className={`inventory-progress-fill ${
                                stockBajo ? 'low' : 'normal'
                              }`}
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                          <span>{stockBajo ? 'Bajo' : 'Normal'}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`inventory-status ${
                            materia.estado?.toLowerCase() === 'activo'
                              ? 'active'
                              : 'inactive'
                          }`}
                        >
                          {materia.estado}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* LOTES */}
      <section className="inventory-panel">
        <div className="inventory-section-heading">
          <div className="inventory-heading-icon lots-heading-icon">
            <ArrowDownToLine size={21} />
          </div>

          <div>
            <h2>Control de lotes recibidos</h2>
            <p>Seguimiento de recepciones, proveedores y vencimientos.</p>
          </div>

          <span className="inventory-heading-count">
            {lotes.length} lotes
          </span>
        </div>

        <div className="inventory-toolbar inventory-lots-toolbar">
          <div className="inventory-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Buscar código, materia prima o proveedor..."
              value={busquedaLotes}
              onChange={(e) => setBusquedaLotes(e.target.value)}
            />
          </div>

          <select
            className="inventory-filter"
            value={filtroLotes}
            onChange={(e) => setFiltroLotes(e.target.value as FiltroLotes)}
          >
            <option value="Todos">Todos los lotes</option>
            <option value="Vencidos">Vencidos</option>
            <option value="Por vencer">Por vencer</option>
            <option value="Vigentes">Vigentes</option>
          </select>
        </div>

        {lotesFiltrados.length === 0 ? (
          <div className="inventory-empty">
            No hay lotes que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>CÓDIGO</th>
                  <th>MATERIA PRIMA</th>
                  <th>PROVEEDOR</th>
                  <th>RECEPCIÓN</th>
                  <th>VENCIMIENTO</th>
                  <th>CANTIDAD</th>
                  <th>ESTADO DEL LOTE</th>
                  <th>CONDICIÓN</th>
                </tr>
              </thead>

              <tbody>
                {lotesFiltrados.map((lote) => {
                  const condicion = clasificarLote(lote.fecha_vencimiento);

                  return (
                    <tr key={lote.id_lote_mp}>
                      <td>
                        <strong className="inventory-reference">
                          {lote.codigo_lote_mp}
                        </strong>
                      </td>

                      <td>
                        <strong>{lote.materia_prima_nombre}</strong>
                      </td>

                      <td>{lote.proveedor_nombre}</td>

                      <td>{formatearFecha(lote.fecha_recepcion)}</td>

                      <td>{formatearFecha(lote.fecha_vencimiento)}</td>

                      <td>{formatearCantidad(lote.cantidad_recibida)}</td>

                      <td>
                        <span className="inventory-status active">
                          {lote.estado}
                        </span>
                      </td>

                      <td>
                        <span className={`inventory-status ${condicion.clase}`}>
                          {condicion.texto}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* PIE */}
      <footer className="inventory-footer">
        <div>
          <Boxes size={17} />
          <span>NEXOLOTE · Centro de inventarios</span>
        </div>

      </footer>



      <Modal open={modalInventarioOpen} onClose={() => setModalInventarioOpen(false)} titulo="Nueva entrada de materia prima" icono={Boxes}>
        <form onSubmit={registrarEntradaInventario}>
          <div className="form-field"><label>Materia prima</label><select value={idMateriaPrimaEntrada} onChange={(e)=>setIdMateriaPrimaEntrada(e.target.value)} required><option value="">Seleccionar materia prima</option>{materiasPrimasParaEntrada.map((x)=>(<option key={x.id_materia_prima} value={x.id_materia_prima}>{x.nombre}</option>))}</select></div>
          <div className="form-field"><label>Proveedor</label><select value={idProveedorEntrada} onChange={(e)=>setIdProveedorEntrada(e.target.value)} required><option value="">Seleccionar proveedor</option>{proveedoresParaEntrada.map((x)=>(<option key={x.id_proveedor} value={x.id_proveedor}>{x.nombre}</option>))}</select></div>
          <div className="form-field"><label>Ubicación</label><select value={idUbicacionEntrada} onChange={(e)=>setIdUbicacionEntrada(e.target.value)} required><option value="">Seleccionar ubicación</option>{ubicacionesParaEntrada.map((x)=>(<option key={x.id_ubicacion} value={x.id_ubicacion}>{x.nombre}</option>))}</select></div>
          <div className="form-row"><div className="form-field"><label>Fecha de recepción</label><input type="date" value={fechaRecepcionEntrada} onChange={(e)=>setFechaRecepcionEntrada(e.target.value)} required /></div><div className="form-field"><label>Fecha de vencimiento</label><input type="date" value={fechaVencimientoEntrada} onChange={(e)=>setFechaVencimientoEntrada(e.target.value)} /></div></div>
          <div className="form-field"><label>Cantidad recibida</label><input type="number" value={cantidadRecibidaEntrada} onChange={(e)=>setCantidadRecibidaEntrada(e.target.value)} required /></div>
          <div className="form-row"><button type="button" className="btn-secundario" onClick={()=>setModalInventarioOpen(false)} disabled={guardandoInventario}>Cancelar</button><button type="submit" className="btn-primario" disabled={guardandoInventario}>{guardandoInventario?"Guardando...":"Registrar entrada"}</button></div>
        </form>
      </Modal>
    </section>
  );
}
