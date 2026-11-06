
import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class ProduccionServiceService {
  constructor(private readonly databaseService: DatabaseService) {}

  // VERIFICAR EL MICROSERVICIO
  getHello(): string {
    return 'Microservicio de Producción funcionando correctamente';
  }

  // CONSULTAR TODOS LOS LOTES
  async listarLotes() {
    return this.databaseService.query<any[]>(
      `SELECT
        l.id_lote,
        l.codigo_lote,
        l.id_producto,
        p.nombre AS producto_nombre,
        l.id_responsable,
        CONCAT(r.nombres, ' ', r.apellidos) AS responsable_nombre,
        l.fecha_produccion,
        l.fecha_vencimiento,
        l.cantidad_producida,
        l.estado
      FROM loteproduccion l
      INNER JOIN producto p
        ON l.id_producto = p.id_producto
      INNER JOIN responsable r
        ON l.id_responsable = r.id_responsable
      ORDER BY l.id_lote DESC`,
    );
  }

  // CONSULTAR PRODUCTOS ACTIVOS
  async listarProductosActivos() {
    return this.databaseService.query<any[]>(
      `SELECT id_producto, nombre
       FROM producto
       WHERE estado = 'Activo'
       ORDER BY nombre ASC`,
    );
  }

  // CONSULTAR RESPONSABLES ACTIVOS
  async listarResponsablesActivos() {
    return this.databaseService.query<any[]>(
      `SELECT
        id_responsable,
        nombres,
        apellidos,
        CONCAT(nombres, ' ', apellidos) AS nombre_completo,
        cargo
       FROM responsable
       WHERE estado = 'Activo'
       ORDER BY nombres ASC`,
    );
  }

  // VALIDAR PRODUCTO Y RESPONSABLE
  private async validarReferencias(
    id_producto: number,
    id_responsable: number,
  ) {
    const productos = await this.databaseService.query<any[]>(
      `SELECT id_producto
       FROM producto
       WHERE id_producto = ? AND estado = 'Activo'`,
      [id_producto],
    );

    if (productos.length === 0) {
      throw new Error('El producto no existe o está inactivo.');
    }

    const responsables = await this.databaseService.query<any[]>(
      `SELECT id_responsable
       FROM responsable
       WHERE id_responsable = ? AND estado = 'Activo'`,
      [id_responsable],
    );

    if (responsables.length === 0) {
      throw new Error('El responsable no existe o está inactivo.');
    }
  }

  // REGISTRAR UN LOTE
  async crearLote(lote: {
    codigo_lote: string;
    id_producto: number;
    id_responsable: number;
    fecha_produccion: string;
    fecha_vencimiento?: string | null;
    cantidad_producida: number;
    estado: string;
  }) {
    await this.validarReferencias(
      lote.id_producto,
      lote.id_responsable,
    );

    const resultado = await this.databaseService.query<any>(
      `INSERT INTO loteproduccion (
        codigo_lote,
        id_producto,
        id_responsable,
        fecha_produccion,
        fecha_vencimiento,
        cantidad_producida,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        lote.codigo_lote,
        lote.id_producto,
        lote.id_responsable,
        lote.fecha_produccion,
        lote.fecha_vencimiento ?? null,
        lote.cantidad_producida,
        lote.estado,
      ],
    );

    return {
      mensaje: 'Lote de producción registrado correctamente',
      id_lote: resultado.insertId,
      codigo_lote: lote.codigo_lote,
    };
  }

  // ACTUALIZAR UN LOTE
  async actualizarLote(
    id_lote: number,
    lote: {
      codigo_lote: string;
      id_producto: number;
      id_responsable: number;
      fecha_produccion: string;
      fecha_vencimiento?: string | null;
      cantidad_producida: number;
      estado: string;
    },
  ) {
    const existente = await this.databaseService.query<any[]>(
      'SELECT id_lote FROM loteproduccion WHERE id_lote = ?',
      [id_lote],
    );

    if (existente.length === 0) {
      throw new Error('El lote que intentas actualizar no existe.');
    }

    await this.validarReferencias(
      lote.id_producto,
      lote.id_responsable,
    );

    await this.databaseService.query<any>(
      `UPDATE loteproduccion
       SET codigo_lote = ?,
           id_producto = ?,
           id_responsable = ?,
           fecha_produccion = ?,
           fecha_vencimiento = ?,
           cantidad_producida = ?,
           estado = ?
       WHERE id_lote = ?`,
      [
        lote.codigo_lote,
        lote.id_producto,
        lote.id_responsable,
        lote.fecha_produccion,
        lote.fecha_vencimiento ?? null,
        lote.cantidad_producida,
        lote.estado,
        id_lote,
      ],
    );

    return {
      mensaje: 'Lote de producción actualizado correctamente',
      id_lote,
    };
  }

  // CANCELAR UN LOTE (ELIMINACIÓN LÓGICA)
  async cancelarLote(id_lote: number) {
    const existente = await this.databaseService.query<any[]>(
      'SELECT id_lote FROM loteproduccion WHERE id_lote = ?',
      [id_lote],
    );

    if (existente.length === 0) {
      throw new Error('El lote que intentas cancelar no existe.');
    }

    await this.databaseService.query<any>(
      `UPDATE loteproduccion
       SET estado = 'Cancelado'
       WHERE id_lote = ?`,
      [id_lote],
    );

    return {
      mensaje: 'Lote de producción cancelado correctamente',
      id_lote,
      estado: 'Cancelado',
    };
  }
}
