import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class CatalogoServiceService {
  constructor(private readonly databaseService: DatabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  // CONSULTAR TODOS LOS PRODUCTOS
  async listarProductos() {
    const productos = await this.databaseService.query<any[]>(
      'SELECT * FROM producto ORDER BY id_producto ASC',
    );

    return productos;
  }

  // REGISTRAR UN NUEVO PRODUCTO
  async crearProducto(producto: {
    nombre: string;
    descripcion?: string;
    unidad_medida: string;
    estado: string;
  }) {
    const resultado = await this.databaseService.query<any>(
      `INSERT INTO producto
       (nombre, descripcion, unidad_medida, estado)
       VALUES (?, ?, ?, ?)`,
      [
        producto.nombre,
        producto.descripcion ?? null,
        producto.unidad_medida,
        producto.estado,
      ],
    );

    return {
      mensaje: 'Producto registrado correctamente',
      id_producto: resultado.insertId,
    };
  }

  // ACTUALIZAR UN PRODUCTO
  async actualizarProducto(
    id_producto: number,
    producto: {
      nombre: string;
      descripcion?: string;
      unidad_medida: string;
      estado: string;
    },
  ) {
    const existente = await this.databaseService.query<any[]>(
      'SELECT id_producto FROM producto WHERE id_producto = ?',
      [id_producto],
    );

    if (existente.length === 0) {
      return {
        mensaje: 'El producto que intentas actualizar no existe',
      };
    }

    await this.databaseService.query<any>(
      `UPDATE producto
       SET nombre = ?,
           descripcion = ?,
           unidad_medida = ?,
           estado = ?
       WHERE id_producto = ?`,
      [
        producto.nombre,
        producto.descripcion ?? null,
        producto.unidad_medida,
        producto.estado,
        id_producto,
      ],
    );

    return {
      mensaje: 'Producto actualizado correctamente',
      id_producto,
    };
  }

  // ELIMINAR UN PRODUCTO (ELIMINACIÓN LÓGICA)
  async eliminarProducto(id_producto: number) {
    const existente = await this.databaseService.query<any[]>(
      'SELECT id_producto FROM producto WHERE id_producto = ?',
      [id_producto],
    );

    if (existente.length === 0) {
      return {
        mensaje: 'El producto no existe',
      };
    }

    await this.databaseService.query<any>(
      'UPDATE producto SET estado = ? WHERE id_producto = ?',
      ['Inactivo', id_producto],
    );

    return {
      mensaje: 'Producto desactivado correctamente',
      id_producto,
      estado: 'Inactivo',
    };
  }
}
