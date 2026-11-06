import { Activity, ArrowUpRight, Boxes, CalendarDays } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Loader from '../../components/common/Loader';

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  page: string;
}

export interface DashboardDay {
  clave: string;
  etiqueta: string;
  cantidad: number;
}

export interface DashboardActivity {
  id: string;
  nombre: string;
  modulo: string;
  fecha: string;
  estado: string;
}

interface DashboardProps {
  stats: DashboardStat[];
  onNavigate: (page: string) => void;
  produccion: {
    cargando: boolean;
    error: string;
    totalSemana: number;
    dias: DashboardDay[];
  };
  inventario: {
    cargando: boolean;
    error: string;
    total: number;
    sobreMinimo: number;
    bajoMinimo: number;
    sinMinimo: number;
  };
  actividad: {
    cargando: boolean;
    error: string;
    registros: DashboardActivity[];
  };
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', { timeZone: 'UTC' });
}

export default function Dashboard({
  stats,
  onNavigate,
  produccion,
  inventario,
  actividad,
}: DashboardProps) {
  const maxLotesPorDia = Math.max(
    ...produccion.dias.map((dia) => dia.cantidad),
    0,
  );
  const totalInventario =
    inventario.sobreMinimo + inventario.bajoMinimo + inventario.sinMinimo;

  return (
    <>
      <section className="welcome-section">
        <div>
          <div className="eyebrow">
            <Activity size={15} /> CENTRO DE OPERACIONES
          </div>
          <h1>Panel de control</h1>
          <p>Supervisa producción, inventario y mantenimiento desde un solo lugar.</p>
        </div>
        <div className="date-card">
          <CalendarDays size={18} />
          <div>
            <span>Hoy</span>
            <strong>
              {new Intl.DateTimeFormat('es-CO', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(new Date())}
            </strong>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="stat-card" key={stat.title}>
              <div className="stat-top">
                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <button
                  type="button"
                  className="more-button"
                  aria-label={`Abrir ${stat.page}`}
                  onClick={() => onNavigate(stat.page)}
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className="stat-change">{stat.change}</div>
            </article>
          );
        })}
      </section>

      <section className="middle-grid">
        <article className="panel production-panel">
          <div className="panel-header">
            <div>
              <h3>Resumen de producción</h3>
              <p>Lotes por fecha de producción en los últimos 7 días</p>
            </div>
            <span className="period-label">Últimos 7 días</span>
          </div>
          <div className="chart-summary">
            <div>
              <strong>
                {produccion.cargando
                  ? '…'
                  : produccion.error
                    ? '—'
                    : produccion.totalSemana}
              </strong>
              <span>Lotes producidos</span>
            </div>
          </div>
          <div className="bar-chart" aria-label="Lotes de producción por día">
            {produccion.dias.map((dia) => (
              <div className="bar-column" key={dia.clave}>
                <div
                  className="bar-track"
                  aria-label={`${dia.cantidad} lotes ${dia.etiqueta}`}
                >
                  <div
                    className="bar-fill"
                    style={{
                      height: maxLotesPorDia
                        ? `${(dia.cantidad / maxLotesPorDia) * 100}%`
                        : '0%',
                    }}
                    title={`${dia.cantidad} lotes`}
                  />
                </div>
                <span>{dia.etiqueta}</span>
              </div>
            ))}
          </div>
          {produccion.error && (
            <p className="chart-message" role="alert">{produccion.error}</p>
          )}
        </article>

        <article className="panel inventory-panel">
          <div className="panel-header">
            <div>
              <h3>Estado del inventario</h3>
              <p>Distribución de existencias</p>
            </div>
            <Boxes size={20} className="panel-icon" />
          </div>
          <div className="inventory-total">
            <strong>
              {inventario.cargando ? '…' : inventario.error ? '—' : inventario.total}
            </strong>
            <span>Materias primas registradas</span>
          </div>
          <div className="inventory-bar" aria-label="Clasificación del stock">
            {!inventario.cargando && !inventario.error && totalInventario > 0 && (
              <>
                {inventario.sobreMinimo > 0 && (
                  <div
                    className="inventory-segment available"
                    style={{ width: `${(inventario.sobreMinimo / totalInventario) * 100}%` }}
                    title={`${inventario.sobreMinimo} sobre el mínimo`}
                  />
                )}
                {inventario.bajoMinimo > 0 && (
                  <div
                    className="inventory-segment low"
                    style={{ width: `${(inventario.bajoMinimo / totalInventario) * 100}%` }}
                    title={`${inventario.bajoMinimo} en o bajo el mínimo`}
                  />
                )}
                {inventario.sinMinimo > 0 && (
                  <div
                    className="inventory-segment no-threshold"
                    style={{ width: `${(inventario.sinMinimo / totalInventario) * 100}%` }}
                    title={`${inventario.sinMinimo} sin mínimo definido`}
                  />
                )}
              </>
            )}
          </div>
          <div className="inventory-legend">
            <div>
              <span className="legend-dot available-dot" />
              Sobre mínimo{' '}
              <strong>
                {inventario.cargando ? '…' : inventario.error ? '—' : inventario.sobreMinimo}
              </strong>
            </div>
            <div>
              <span className="legend-dot low-dot" />
              En o bajo el mínimo{' '}
              <strong>
                {inventario.cargando ? '…' : inventario.error ? '—' : inventario.bajoMinimo}
              </strong>
            </div>
            <div>
              <span className="legend-dot no-threshold-dot" />
              Sin mínimo definido{' '}
              <strong>
                {inventario.cargando ? '…' : inventario.error ? '—' : inventario.sinMinimo}
              </strong>
            </div>
          </div>
          {inventario.error && (
            <p className="chart-message" role="alert">{inventario.error}</p>
          )}
        </article>
      </section>

      <section className="panel activity-panel">
        <div className="panel-header">
          <div>
            <h3>Actividad reciente</h3>
            <p>Últimos movimientos registrados en el sistema</p>
          </div>
          <button
            type="button"
            className="view-all"
            onClick={() => onNavigate('Producción')}
          >
            Ver módulos <ArrowUpRight size={16} />
          </button>
        </div>

        {actividad.error && (
          <p className="chart-message" role="alert">
            {actividad.error}
          </p>
        )}
        {actividad.cargando ? (
          <Loader label="Cargando actividad reciente..." />
        ) : actividad.registros.length === 0 ? (
          <p className="catalog-message">No hay movimientos registrados para mostrar.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>REFERENCIA</th>
                  <th>DESCRIPCIÓN</th>
                  <th>MÓDULO</th>
                  <th>FECHA</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {actividad.registros.map((registro) => {
                  const estado = registro.estado.toLowerCase();
                  const claseEstado =
                    estado.includes('complet') || estado.includes('realiz')
                      ? 'completed'
                      : estado.includes('pend') || estado.includes('program')
                        ? 'pending'
                        : 'processing';

                  return (
                    <tr key={`${registro.modulo}-${registro.id}`}>
                      <td className="reference">{registro.id}</td>
                      <td>{registro.nombre}</td>
                      <td>{registro.modulo}</td>
                      <td className="date-cell">{formatearFecha(registro.fecha)}</td>
                      <td>
                        <span className={`status-badge ${claseEstado}`}>
                          {registro.estado}
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
    </>
  );
}
