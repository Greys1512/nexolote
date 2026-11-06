import { useEffect, useState } from 'react';
import type { DashboardStat } from '../pages/Dashboard/Dashboard';
import type {
  ActividadDashboard,
  EquipoMantenimiento,
  LoteMateriaPrima,
  LoteProduccion,
  MantenimientoRegistro,
  MateriaPrima,
  Producto,
} from '../types/domain';
import { apiFetch } from '../services/api';
import { Boxes, Factory, Package, Wrench } from 'lucide-react';

export function useDashboard(enabled: boolean) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [lotes, setLotes] = useState<LoteProduccion[]>([]);
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [lotesMateriaPrima, setLotesMateriaPrima] = useState<LoteMateriaPrima[]>([]);
  const [mantenimientos, setMantenimientos] = useState<MantenimientoRegistro[]>([]);
  const [equipos, setEquipos] = useState<EquipoMantenimiento[]>([]);

  const [cargando, setCargando] = useState({ productos: true, lotes: true, materias: true, lotesMp: true, mantenimientos: true, equipos: true });
  const [errores, setErrores] = useState({ productos: '', lotes: '', materias: '', lotesMp: '', mantenimientos: '', equipos: '' });

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const cargar = async <T,>(ruta: string, set: (d: T) => void, key: keyof typeof cargando) => {
      try {
        const r = await apiFetch(ruta, { signal: controller.signal });
        if (!r.ok) throw new Error(`No se pudieron cargar los datos de ${ruta}.`);
        set((await r.json()) as T);
        setErrores((e) => ({ ...e, [key]: '' }));
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setErrores((e) => ({ ...e, [key]: error instanceof Error ? error.message : 'Error al cargar el resumen.' }));
      } finally {
        if (!controller.signal.aborted) setCargando((c) => ({ ...c, [key]: false }));
      }
    };
    void Promise.all([
      cargar<Producto[]>('/catalogo/productos', setProductos, 'productos'),
      cargar<LoteProduccion[]>('/produccion/lotes', setLotes, 'lotes'),
      cargar<MateriaPrima[]>('/inventario/materias-primas', setMateriasPrimas, 'materias'),
      cargar<LoteMateriaPrima[]>('/inventario/lotes-materia-prima', setLotesMateriaPrima, 'lotesMp'),
      cargar<MantenimientoRegistro[]>('/mantenimiento/registros', setMantenimientos, 'mantenimientos'),
      cargar<EquipoMantenimiento[]>('/mantenimiento/equipos', setEquipos, 'equipos'),
    ]);
    return () => controller.abort();
  }, [enabled]);

  const val = (v: number, c: boolean, e: string) => (e ? '—' : c ? '…' : v.toString().padStart(2, '0'));
  const det = (c: boolean, e: string, d: string) => e || (c ? 'Cargando...' : d);

  const stats: DashboardStat[] = [
    { title: 'Productos registrados', value: val(productos.length, cargando.productos, errores.productos), change: det(cargando.productos, errores.productos, 'En catálogo'), icon: Package, color: 'blue', page: 'Catálogo' },
    { title: 'Lotes de producción', value: val(lotes.length, cargando.lotes, errores.lotes), change: det(cargando.lotes, errores.lotes, 'Total registrado'), icon: Factory, color: 'purple', page: 'Producción' },
    { title: 'Materias primas', value: val(materiasPrimas.length, cargando.materias, errores.materias), change: det(cargando.materias, errores.materias, 'Referencias'), icon: Boxes, color: 'orange', page: 'Inventario' },
    { title: 'Equipos registrados', value: val(equipos.length, cargando.equipos, errores.equipos), change: det(cargando.equipos, errores.equipos, 'En el sistema'), icon: Wrench, color: 'green', page: 'Mantenimiento' },
  ];

  const fechaHoy = new Date(); fechaHoy.setHours(0, 0, 0, 0);
  const hoyClave = [fechaHoy.getFullYear(), String(fechaHoy.getMonth() + 1).padStart(2, '0'), String(fechaHoy.getDate()).padStart(2, '0')].join('-');

  const actividadesRecientes: ActividadDashboard[] = [
    ...lotes.map((l) => ({ id: l.codigo_lote, nombre: `Producción de ${l.producto_nombre}`, modulo: 'Producción', fecha: l.fecha_produccion, timestamp: new Date(l.fecha_produccion).getTime(), estado: l.estado })),
    ...lotesMateriaPrima.map((l) => ({ id: l.codigo_lote_mp, nombre: `Entrada de ${l.materia_prima_nombre}`, modulo: 'Inventario', fecha: l.fecha_recepcion, timestamp: new Date(l.fecha_recepcion).getTime(), estado: l.estado })),
    ...mantenimientos.map((r) => { const fecha = r.fecha_realizacion ?? r.fecha_programada ?? ''; return { id: `MNT-${r.id_mantenimiento}`, nombre: `${r.tipo_mantenimiento} - ${r.nombre_equipo}`, modulo: 'Mantenimiento', fecha, timestamp: new Date(fecha).getTime(), estado: r.estado }; }),
  ].filter((a) => Number.isFinite(a.timestamp) && a.fecha.substring(0, 10) <= hoyClave).sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  const lotesPorDia = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(fechaHoy); d.setDate(fechaHoy.getDate() - (6 - i));
    const clave = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    return { clave, etiqueta: d.toLocaleDateString('es-CO', { weekday: 'short' }), cantidad: lotes.filter((l) => l.fecha_produccion.substring(0, 10) === clave).length };
  });
  const lotesUltimosSieteDias = lotesPorDia.reduce((t, d) => t + d.cantidad, 0);

  const conteoInventario = materiasPrimas.reduce((c, m) => {
    if (m.stock_minimo === null) c.sinMinimo += 1;
    else if (Number(m.cantidad_disponible) <= Number(m.stock_minimo)) c.bajoMinimo += 1;
    else c.sobreMinimo += 1;
    return c;
  }, { sobreMinimo: 0, bajoMinimo: 0, sinMinimo: 0 });

  return {
    stats,
    produccion: { cargando: cargando.lotes, error: errores.lotes, totalSemana: lotesUltimosSieteDias, dias: lotesPorDia },
    inventario: { cargando: cargando.materias, error: errores.materias, total: materiasPrimas.length, sobreMinimo: conteoInventario.sobreMinimo, bajoMinimo: conteoInventario.bajoMinimo, sinMinimo: conteoInventario.sinMinimo },
    actividad: { cargando: cargando.lotes || cargando.lotesMp || cargando.mantenimientos, error: errores.lotesMp || errores.mantenimientos ? 'No se pudieron cargar todos los movimientos del dashboard.' : '', registros: actividadesRecientes },
  };
}
