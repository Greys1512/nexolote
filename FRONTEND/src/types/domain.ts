export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  unidad_medida: string;
  estado: string;
}

export interface LoteProduccion {
  id_lote: number;
  codigo_lote: string;
  id_producto: number;
  producto_nombre: string;
  id_responsable: number;
  responsable_nombre: string;
  fecha_produccion: string;
  fecha_vencimiento: string | null;
  cantidad_producida: number | string;
  estado: string;
}

export interface MateriaPrima {
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

export interface LoteMateriaPrima {
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

export interface MantenimientoRegistro {
  id_mantenimiento: number;
  id_equipo: number;
  codigo_inventario: string;
  nombre_equipo: string;
  tipo_equipo: string | null;
  id_responsable: number;
  nombre_responsable: string;
  fecha_programada: string | null;
  fecha_realizacion: string | null;
  tipo_mantenimiento: string;
  descripcion: string | null;
  costo: number | string | null;
  estado: string;
}

export interface EquipoMantenimiento {
  id_equipo: number;
  codigo_inventario: string;
  nombre: string;
  tipo_equipo: string | null;
  marca: string | null;
  modelo: string | null;
  estado: string;
  id_ubicacion: number;
}

export interface ResponsableMantenimiento {
  id_responsable: number;
  nombres: string;
  apellidos: string;
  cargo: string | null;
  telefono: string | null;
  correo: string | null;
  estado: string;
}

export interface IncidenciaMantenimiento {
  id_incidencia: number;
  id_lote: number;
  codigo_lote: string;
  nombre_producto: string;
  id_responsable: number | null;
  nombre_responsable: string | null;
  fecha_registro: string;
  tipo_incidencia: string;
  descripcion: string | null;
  estado: string;
}

export interface ActividadDashboard {
  id: string;
  nombre: string;
  modulo: string;
  fecha: string;
  timestamp: number;
  estado: string;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}
