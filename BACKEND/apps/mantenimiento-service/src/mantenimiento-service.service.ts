
import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class MantenimientoServiceService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Verificar funcionamiento del servicio
  getHello(): string {
    return 'Servicio de Mantenimiento funcionando correctamente';
  }

  // Consultar mantenimientos registrados
  async listarMantenimientos(): Promise<any[]> {
    return this.databaseService.query<any[]>(
      `
      SELECT
        m.id_mantenimiento,
        m.id_equipo,
        e.codigo_inventario,
        e.nombre AS nombre_equipo,
        e.tipo_equipo,
        m.id_responsable,
        CONCAT(r.nombres, ' ', r.apellidos) AS nombre_responsable,
        m.fecha_programada,
        m.fecha_realizacion,
        m.tipo_mantenimiento,
        m.descripcion,
        m.costo,
        m.estado
      FROM mantenimiento m
      INNER JOIN equipo e
        ON m.id_equipo = e.id_equipo
      INNER JOIN responsable r
        ON m.id_responsable = r.id_responsable
      ORDER BY m.id_mantenimiento DESC
      `,
    );
  }

  // Consultar equipos activos
  async listarEquiposActivos(): Promise<any[]> {
    return this.databaseService.query<any[]>(
      `
      SELECT
        id_equipo,
        codigo_inventario,
        nombre,
        tipo_equipo,
        marca,
        modelo,
        estado,
        id_ubicacion
      FROM equipo
      WHERE estado = 'Activo'
      ORDER BY nombre ASC
      `,
    );
  }

  // Consultar responsables activos
  async listarResponsablesActivos(): Promise<any[]> {
    return this.databaseService.query<any[]>(
      `
      SELECT
        id_responsable,
        nombres,
        apellidos,
        cargo,
        telefono,
        correo,
        estado
      FROM responsable
      WHERE estado = 'Activo'
      ORDER BY nombres ASC
      `,
    );
  }

  // Consultar incidencias registradas
  async listarIncidencias(): Promise<any[]> {
    return this.databaseService.query<any[]>(
      `
      SELECT
        i.id_incidencia,
        i.id_lote,
        l.codigo_lote,
        p.nombre AS nombre_producto,
        i.id_responsable,
        CONCAT(r.nombres, ' ', r.apellidos) AS nombre_responsable,
        i.fecha_registro,
        i.tipo_incidencia,
        i.descripcion,
        i.estado
      FROM incidencia i
      INNER JOIN loteproduccion l
        ON i.id_lote = l.id_lote
      INNER JOIN producto p
        ON l.id_producto = p.id_producto
      LEFT JOIN responsable r
        ON i.id_responsable = r.id_responsable
      ORDER BY i.fecha_registro DESC
      `,
    );
  }

  // REGISTRAR UN NUEVO MANTENIMIENTO
  async crearMantenimiento(datos: {
    id_equipo: number;
    id_responsable: number;
    fecha_programada: string;
    tipo_mantenimiento: string;
    descripcion?: string;
    costo?: number | null;
    estado: string;
  }) {
    const resultado = await this.databaseService.query<any>(
      `INSERT INTO mantenimiento
        (id_equipo, id_responsable, fecha_programada, tipo_mantenimiento, descripcion, costo, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.id_equipo,
        datos.id_responsable,
        datos.fecha_programada,
        datos.tipo_mantenimiento,
        datos.descripcion ?? null,
        datos.costo ?? null,
        datos.estado,
      ],
    );
    return {
      mensaje: 'Mantenimiento registrado correctamente',
      id_mantenimiento: resultado.insertId,
    };
  }
}
