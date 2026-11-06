import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Check,
  ChevronRight,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import type { Usuario } from '../../services/api';
import { apiFetch } from '../../services/api';
import type { ActividadDashboard } from '../../types/domain';
import { useTheme } from '../../hooks/useTheme';

interface NavbarProps {
  activePage: string;
  usuario: Usuario | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  actividad: ActividadDashboard[];
  stockBajo: number;
}

interface SearchSource {
  endpoint: string;
  page: string;
  label: string;
  detailFields: string[];
}

interface SearchResult {
  id: string;
  page: string;
  label: string;
  detail: string;
}

interface NotificationItem {
  id: string;
  page: string;
  title: string;
  detail: string;
  date?: string;
}

const SEARCH_SOURCES: SearchSource[] = [
  { endpoint: '/catalogo/productos', page: 'Catálogo', label: 'nombre', detailFields: ['unidad_medida', 'estado'] },
  { endpoint: '/produccion/lotes', page: 'Producción', label: 'codigo_lote', detailFields: ['producto_nombre', 'responsable_nombre', 'estado'] },
  { endpoint: '/inventario/materias-primas', page: 'Inventario', label: 'nombre', detailFields: ['unidad_medida', 'estado'] },
  { endpoint: '/inventario/lotes-materia-prima', page: 'Inventario', label: 'codigo_lote_mp', detailFields: ['materia_prima_nombre', 'proveedor_nombre', 'estado'] },
  { endpoint: '/mantenimiento/registros', page: 'Mantenimiento', label: 'nombre_equipo', detailFields: ['tipo_mantenimiento', 'estado'] },
];

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
}

export default function Navbar({
  activePage,
  usuario,
  onLogout,
  onNavigate,
  actividad,
  stockBajo,
}: NavbarProps) {
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<SearchResult[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const { tema, alternarTema } = useTheme();
  const [notificacionesLeidas, setNotificacionesLeidas] = useState<string[]>(
    () => {
      const guardadas = localStorage.getItem('nexolote:readNotifications');
      return guardadas ? guardadas.split('|').filter(Boolean) : [];
    },
  );
  const perfilRef = useRef<HTMLDivElement>(null);
  const busquedaRef = useRef<HTMLDivElement>(null);
  const notificacionesRef = useRef<HTMLDivElement>(null);

  const notificaciones = useMemo<NotificationItem[]>(() => {
    const movimientos: NotificationItem[] = actividad.map((item) => ({
      id: `actividad-${encodeURIComponent(item.id)}`,
      page: item.modulo,
      title: item.nombre,
      detail: `${item.modulo} · ${item.estado}`,
      date: item.fecha,
    }));

    if (stockBajo > 0) {
      movimientos.unshift({
        id: `stock-bajo-${stockBajo}`,
        page: 'Inventario',
        title: `${stockBajo} materia${stockBajo === 1 ? '' : 's'} prima${stockBajo === 1 ? '' : 's'} en nivel bajo`,
        detail: 'Revisa las existencias del inventario.',
      });
    }

    return movimientos;
  }, [actividad, stockBajo]);

  const sinLeer = notificaciones.filter(
    (item) => !notificacionesLeidas.includes(item.id),
  ).length;

  useEffect(() => {
    const termino = busqueda.trim();
    if (termino.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setBuscando(true);
      setErrorBusqueda('');

      void Promise.allSettled(
        SEARCH_SOURCES.map(async (source) => {
          const response = await apiFetch(source.endpoint, {
            signal: controller.signal,
          });
          if (!response.ok) {
            throw new Error(`No se pudo buscar en ${source.page}.`);
          }

          const data: unknown = await response.json();
          if (!Array.isArray(data)) {
            throw new Error(`La respuesta de ${source.page} no es válida.`);
          }

          const palabras = normalizar(termino)
            .split(/\s+/)
            .filter(Boolean);

          return (data as Record<string, unknown>[])
            .map((record, index) => {
              const labelValue = record[source.label];
              const label =
                typeof labelValue === 'string' || typeof labelValue === 'number'
                  ? String(labelValue)
                  : source.page;
              const detail = source.detailFields
                .map((field) => record[field])
                .filter(
                  (value): value is string | number =>
                    typeof value === 'string' || typeof value === 'number',
                )
                .map(String)
                .join(' · ');
              const searchable = normalizar(
                Object.values(record)
                  .filter(
                    (value): value is string | number =>
                      typeof value === 'string' || typeof value === 'number',
                  )
                  .map(String)
                  .join(' '),
              );

              return {
                id: `${source.endpoint}-${String(record.id ?? index)}-${index}`,
                page: source.page,
                label,
                detail,
                searchable,
              };
            })
            .filter((record) =>
              palabras.every((palabra) => record.searchable.includes(palabra)),
            )
            .map((record) => ({
              id: record.id,
              page: record.page,
              label: record.label,
              detail: record.detail,
            }));
        }),
      ).then((settled) => {
        if (controller.signal.aborted) return;

        const successful = settled.filter(
          (item): item is PromiseFulfilledResult<SearchResult[]> =>
            item.status === 'fulfilled',
        );
        const failedCount = settled.length - successful.length;
        setResultados(
          successful
            .flatMap((item) => item.value)
            .slice(0, 10),
        );
        setErrorBusqueda(
          failedCount === settled.length
            ? 'No se pudo buscar en los módulos. Revisa la conexión e inténtalo de nuevo.'
            : failedCount > 0
              ? 'Algunos módulos no están disponibles; los resultados pueden estar incompletos.'
              : '',
        );
        setBuscando(false);
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [busqueda]);

  useEffect(() => {
    const manejarClickFuera = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      if (perfilRef.current && !perfilRef.current.contains(event.target)) {
        setPerfilOpen(false);
      }
      if (busquedaRef.current && !busquedaRef.current.contains(event.target)) {
        setBusqueda('');
      }
      if (
        notificacionesRef.current &&
        !notificacionesRef.current.contains(event.target)
      ) {
        setNotificacionesOpen(false);
      }
    };

    document.addEventListener('mousedown', manejarClickFuera);
    return () => document.removeEventListener('mousedown', manejarClickFuera);
  }, []);

  const salir = () => {
    setPerfilOpen(false);
    onLogout();
  };

  const abrirResultado = (page: string) => {
    onNavigate(page);
    setBusqueda('');
  };

  const marcarTodasLeidas = () => {
    const leidas = Array.from(
      new Set([...notificacionesLeidas, ...notificaciones.map((item) => item.id)]),
    );
    setNotificacionesLeidas(leidas);
    localStorage.setItem('nexolote:readNotifications', leidas.join('|'));
  };

  const abrirNotificacion = (item: NotificationItem) => {
    if (!notificacionesLeidas.includes(item.id)) {
      const leidas = [...notificacionesLeidas, item.id];
      setNotificacionesLeidas(leidas);
      localStorage.setItem('nexolote:readNotifications', leidas.join('|'));
    }
    setNotificacionesOpen(false);
    onNavigate(item.page);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{activePage}</h1>
        <div className="breadcrumb">
          <span>Inicio</span>
          <span className="breadcrumb-separator">/</span>
          <strong>{activePage}</strong>
        </div>
      </div>

      <div className="topbar-right">
        <div className="buscador-contenedor" ref={busquedaRef}>
          <label className="buscador">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar registros..."
              className="buscador-input"
              aria-label="Buscar en los módulos"
              aria-expanded={busqueda.trim().length >= 2}
              aria-controls="resultados-busqueda"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>
          {busqueda.trim().length >= 2 && (
            <div
              className="busqueda-resultados"
              id="resultados-busqueda"
              role="region"
              aria-label="Resultados de búsqueda"
              aria-live="polite"
            >
              {buscando ? (
                <p className="busqueda-estado">Buscando en los módulos...</p>
              ) : (
                <>
                  {errorBusqueda && (
                    <p className="busqueda-error" role="alert">
                      {errorBusqueda}
                    </p>
                  )}
                  {resultados.length > 0 ? (
                    resultados.map((resultado) => (
                      <button
                        type="button"
                        className="busqueda-resultado"
                        key={resultado.id}
                        onClick={() => abrirResultado(resultado.page)}
                      >
                        <span>
                          <strong>{resultado.label}</strong>
                          <small>{resultado.detail || resultado.page}</small>
                        </span>
                        <span className="busqueda-modulo">
                          {resultado.page}
                          <ChevronRight size={15} />
                        </span>
                      </button>
                    ))
                  ) : (
                    !errorBusqueda && (
                      <p className="busqueda-estado">
                        No hay registros que coincidan.
                      </p>
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="topbar-grupo">
          <button
            type="button"
            className="tema-toggle"
            title={tema === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            aria-label={tema === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
            aria-pressed={tema === 'dark'}
            onClick={alternarTema}
          >
            {tema === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <div className="notificaciones-contenedor" ref={notificacionesRef}>
            <button
              type="button"
              className="notificaciones"
              title="Notificaciones"
              aria-label={`Notificaciones${sinLeer ? ` (${sinLeer} sin leer)` : ''}`}
              aria-expanded={notificacionesOpen}
              aria-controls="panel-notificaciones"
              onClick={() => setNotificacionesOpen((abierto) => !abierto)}
            >
              <Bell size={20} />
              {sinLeer > 0 && (
                <span className="notification-dot" aria-hidden="true" />
              )}
            </button>
            {notificacionesOpen && (
              <section
                className="notificaciones-panel"
                id="panel-notificaciones"
                aria-label="Notificaciones"
              >
                <div className="notificaciones-header">
                  <div>
                    <strong>Notificaciones</strong>
                    <span>{sinLeer ? `${sinLeer} sin leer` : 'Todo al día'}</span>
                  </div>
                  {sinLeer > 0 && (
                    <button
                      type="button"
                      className="notificaciones-marcar"
                      onClick={marcarTodasLeidas}
                    >
                      <Check size={14} />
                      Marcar leídas
                    </button>
                  )}
                </div>
                <div className="notificaciones-lista">
                  {notificaciones.length === 0 ? (
                    <p className="notificaciones-vacias">
                      No hay movimientos ni alertas nuevas.
                    </p>
                  ) : (
                    notificaciones.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={`notificacion-item ${notificacionesLeidas.includes(item.id) ? 'leida' : ''}`}
                        onClick={() => abrirNotificacion(item)}
                      >
                        <span className="notificacion-indicador" />
                        <span className="notificacion-contenido">
                          <strong>{item.title}</strong>
                          <small>{item.detail}</small>
                          {item.date && (
                            <time dateTime={item.date}>
                              {new Date(item.date).toLocaleDateString('es-CO', {
                                timeZone: 'UTC',
                              })}
                            </time>
                          )}
                        </span>
                        <ChevronRight size={16} aria-hidden="true" />
                      </button>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="perfil-dropdown" ref={perfilRef}>
            <button
              type="button"
              className="perfil-btn"
              aria-label="Abrir menú de perfil"
              aria-expanded={perfilOpen}
              onClick={() => setPerfilOpen((abierto) => !abierto)}
            >
              <span className="avatar">
                {usuario?.nombre.slice(0, 2).toUpperCase() ?? 'AD'}
              </span>
            </button>
            <div className={`perfil-menu ${perfilOpen ? 'open' : ''}`}>
              <div className="perfil-menu-item">
                <strong>{usuario?.nombre ?? 'Administrador'}</strong>
                <span>{usuario?.rol ?? 'Panel de gestión'}</span>
              </div>
              <div className="perfil-divider" />
              <button
                type="button"
                className="perfil-menu-item cerrar"
                onClick={salir}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
