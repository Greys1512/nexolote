import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DatabaseService } from './database/database.service';

interface DatosEntrada {
  id_materia_prima: number;
  id_proveedor: number;
  id_ubicacion: number;
  fecha_recepcion: string;
  fecha_vencimiento?: string | null;
  cantidad_recibida: number;
}

@Injectable()
export class InventarioServiceService {
  constructor(private readonly databaseService: DatabaseService) {}

  // ==========================================
  // VERIFICAR MICROSERVICIO
  // ==========================================

  getHello(): string {
    return 'Microservicio de Inventario funcionando correctamente';
  }

  // ==========================================
  // DASHBOARD GENERAL
  // ==========================================

  async obtenerDashboard() {
    const [resumen] = await this.databaseService.query<any[]>(
      `SELECT
        (SELECT COUNT(*) FROM materiaprima) AS total_materias_primas,

        (SELECT COUNT(*) FROM lotemateriaprima) AS total_lotes,

        (
          SELECT COUNT(*)
          FROM lotemateriaprima
          WHERE fecha_vencimiento < CURDATE()
        ) AS lotes_vencidos,

        (
          SELECT COUNT(*)
          FROM lotemateriaprima
          WHERE fecha_vencimiento >= CURDATE()
            AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        ) AS lotes_por_vencer,

        (
          SELECT COUNT(*)
          FROM (
            SELECT mp.id_materia_prima
            FROM materiaprima mp

            LEFT JOIN (
              SELECT
                id_materia_prima,
                SUM(cantidad_recibida) AS total_recibido
              FROM lotemateriaprima
              GROUP BY id_materia_prima
            ) entradas
              ON mp.id_materia_prima = entradas.id_materia_prima

            LEFT JOIN (
              SELECT
                lm.id_materia_prima,
                SUM(cm.cantidad_utilizada) AS total_utilizado
              FROM lotemateriaprima lm
              INNER JOIN consumomateriaprima cm
                ON lm.id_lote_mp = cm.id_lote_mp
              GROUP BY lm.id_materia_prima
            ) consumos
              ON mp.id_materia_prima = consumos.id_materia_prima

            WHERE
              COALESCE(entradas.total_recibido, 0)
              - COALESCE(consumos.total_utilizado, 0)
              <= COALESCE(mp.stock_minimo, 0)
          ) AS stock_bajo
        ) AS materias_primas_stock_bajo,

        (SELECT COUNT(*) FROM consumomateriaprima) AS total_consumos`,
    );

    return resumen;
  }

  // ==========================================
  // LISTAR MATERIAS PRIMAS Y EXISTENCIAS
  // ==========================================

  async listarMateriasPrimas() {
    return this.databaseService.query<any[]>(
      `SELECT
        mp.id_materia_prima,
        mp.nombre,
        mp.descripcion,
        mp.unidad_medida,
        mp.stock_minimo,
        mp.estado,
        COALESCE(entradas.cantidad_recibida, 0) AS cantidad_recibida,
        COALESCE(consumos.cantidad_utilizada, 0) AS cantidad_utilizada,
        COALESCE(entradas.cantidad_recibida, 0)
          - COALESCE(consumos.cantidad_utilizada, 0) AS cantidad_disponible
      FROM materiaprima mp

      LEFT JOIN (
        SELECT
          id_materia_prima,
          SUM(cantidad_recibida) AS cantidad_recibida
        FROM lotemateriaprima
        GROUP BY id_materia_prima
      ) entradas
        ON mp.id_materia_prima = entradas.id_materia_prima

      LEFT JOIN (
        SELECT
          lm.id_materia_prima,
          SUM(cm.cantidad_utilizada) AS cantidad_utilizada
        FROM lotemateriaprima lm
        INNER JOIN consumomateriaprima cm
          ON lm.id_lote_mp = cm.id_lote_mp
        GROUP BY lm.id_materia_prima
      ) consumos
        ON mp.id_materia_prima = consumos.id_materia_prima

      ORDER BY mp.nombre ASC`,
    );
  }

  // ==========================================
  // LISTAR LOTES DE MATERIAS PRIMAS
  // ==========================================

  async listarLotesMateriaPrima() {
    return this.databaseService.query<any[]>(
      `SELECT
        lm.id_lote_mp,
        lm.codigo_lote_mp,
        lm.id_materia_prima,
        mp.nombre AS materia_prima_nombre,
        lm.id_proveedor,
        p.nombre AS proveedor_nombre,
        lm.id_ubicacion,
        u.nombre AS ubicacion_nombre,
        lm.fecha_recepcion,
        lm.fecha_vencimiento,
        lm.cantidad_recibida,
        lm.estado
      FROM lotemateriaprima lm

      INNER JOIN materiaprima mp
        ON lm.id_materia_prima = mp.id_materia_prima

      INNER JOIN proveedor p
        ON lm.id_proveedor = p.id_proveedor

      INNER JOIN ubicacion u
        ON lm.id_ubicacion = u.id_ubicacion

      ORDER BY lm.fecha_recepcion DESC`,
    );
  }

  // ==========================================
  // LISTAR PROVEEDORES
  // ==========================================

  async listarProveedores() {
    return this.databaseService.query<any[]>(
      `SELECT
        id_proveedor,
        nombre,
        identificacion,
        telefono,
        correo,
        direccion
      FROM proveedor
      ORDER BY nombre ASC`,
    );
  }

  // ==========================================
  // LISTAR UBICACIONES
  // ==========================================

  async listarUbicaciones() {
    return this.databaseService.query<any[]>(
      `SELECT
        id_ubicacion,
        nombre,
        tipo_ubicacion,
        descripcion
      FROM ubicacion
      ORDER BY nombre ASC`,
    );
  }

  // ==========================================
  // VALIDAR FECHAS
  // ==========================================

  private fechaValida(fecha: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return false;
    }

    const [anio, mes, dia] = fecha.split('-').map(Number);
    const fechaComprobada = new Date(anio, mes - 1, dia);

    return (
      fechaComprobada.getFullYear() === anio &&
      fechaComprobada.getMonth() === mes - 1 &&
      fechaComprobada.getDate() === dia
    );
  }

  // ==========================================
  // REGISTRAR ENTRADA DE MATERIA PRIMA
  // ==========================================

  async registrarEntrada(datos: DatosEntrada) {
    const idMateriaPrima = Number(datos?.id_materia_prima);
    const idProveedor = Number(datos?.id_proveedor);
    const idUbicacion = Number(datos?.id_ubicacion);
    const cantidad = Number(datos?.cantidad_recibida);

    const fechaRecepcion = datos?.fecha_recepcion;
    const fechaVencimiento = datos?.fecha_vencimiento || null;

    // VALIDAR IDENTIFICADORES
    if (
      !Number.isInteger(idMateriaPrima) ||
      idMateriaPrima <= 0 ||
      !Number.isInteger(idProveedor) ||
      idProveedor <= 0 ||
      !Number.isInteger(idUbicacion) ||
      idUbicacion <= 0
    ) {
      throw new BadRequestException(
        'Debes seleccionar una materia prima, un proveedor y una ubicación válidos.',
      );
    }

    // VALIDAR CANTIDAD
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      throw new BadRequestException(
        'La cantidad recibida debe ser mayor que cero.',
      );
    }

    // VALIDAR FECHA DE RECEPCIÓN
    if (
      typeof fechaRecepcion !== 'string' ||
      !this.fechaValida(fechaRecepcion)
    ) {
      throw new BadRequestException(
        'La fecha de recepción no tiene un formato válido.',
      );
    }

    // VALIDAR FECHA DE VENCIMIENTO
    if (
      fechaVencimiento !== null &&
      (typeof fechaVencimiento !== 'string' ||
        !this.fechaValida(fechaVencimiento))
    ) {
      throw new BadRequestException(
        'La fecha de vencimiento no tiene un formato válido.',
      );
    }

    if (
      fechaVencimiento !== null &&
      fechaVencimiento < fechaRecepcion
    ) {
      throw new BadRequestException(
        'La fecha de vencimiento no puede ser anterior a la fecha de recepción.',
      );
    }

    // COMPROBAR QUE EXISTA LA MATERIA PRIMA
    const materias = await this.databaseService.query<any[]>(
      `SELECT id_materia_prima
       FROM materiaprima
       WHERE id_materia_prima = ?
       LIMIT 1`,
      [idMateriaPrima],
    );

    if (materias.length === 0) {
      throw new BadRequestException('La materia prima seleccionada no existe.');
    }

    // COMPROBAR QUE EXISTA EL PROVEEDOR
    const proveedores = await this.databaseService.query<any[]>(
      `SELECT id_proveedor
       FROM proveedor
       WHERE id_proveedor = ?
       LIMIT 1`,
      [idProveedor],
    );

    if (proveedores.length === 0) {
      throw new BadRequestException('El proveedor seleccionado no existe.');
    }

    // COMPROBAR QUE EXISTA LA UBICACIÓN
    const ubicaciones = await this.databaseService.query<any[]>(
      `SELECT id_ubicacion
       FROM ubicacion
       WHERE id_ubicacion = ?
       LIMIT 1`,
      [idUbicacion],
    );

    if (ubicaciones.length === 0) {
      throw new BadRequestException('La ubicación seleccionada no existe.');
    }

    // GENERAR CÓDIGO ÚNICO DEL LOTE
    const codigoLote =
      `MP-${fechaRecepcion.replace(/-/g, '')}-` +
      randomUUID().slice(0, 8).toUpperCase();

    // REGISTRAR EL LOTE
    const resultado = await this.databaseService.query<any>(
      `INSERT INTO lotemateriaprima (
        codigo_lote_mp,
        id_materia_prima,
        id_proveedor,
        id_ubicacion,
        fecha_recepcion,
        fecha_vencimiento,
        cantidad_recibida,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigoLote,
        idMateriaPrima,
        idProveedor,
        idUbicacion,
        fechaRecepcion,
        fechaVencimiento,
        cantidad,
        'Disponible',
      ],
    );

    return {
      mensaje: 'Entrada de materia prima registrada correctamente.',
      id_lote_mp: resultado.insertId,
      codigo_lote_mp: codigoLote,
    };
  }
}