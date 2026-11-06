
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProductosService {
  constructor(private readonly database: DatabaseService) {}

  // Consultar todos los productos
  async findAll() {
    return this.database.query(
      'SELECT * FROM producto'
    );
  }

  // Consultar un producto por su ID
  async findOne(id: number) {
    const productos = await this.database.query<any[]>(
      'SELECT * FROM producto WHERE id_producto = ?',
      [id]
    );

    return productos[0] || null;
  }

  // Registrar un producto
  async create(data: any) {
    const result = await this.database.query<any>(
      `INSERT INTO producto
       (nombre, descripcion, unidad_medida, estado)
       VALUES (?, ?, ?, ?)`,
      [
        data.nombre,
        data.descripcion ?? null,
        data.unidad_medida,
        data.estado
      ]
    );

    return {
      mensaje: 'Producto registrado correctamente',
      id_producto: result.insertId
    };
  }

  // Actualizar un producto
  async update(id: number, data: any) {
    const result = await this.database.query<any>(
      `UPDATE producto
       SET nombre = ?, descripcion = ?,
           unidad_medida = ?, estado = ?
       WHERE id_producto = ?`,
      [
        data.nombre,
        data.descripcion ?? null,
        data.unidad_medida,
        data.estado,
        id
      ]
    );

    return {
      mensaje: 'Operación de actualización realizada',
      filas_afectadas: result.affectedRows
    };
  }

  // Eliminar un producto
  async remove(id: number) {
    const result = await this.database.query<any>(
      'DELETE FROM producto WHERE id_producto = ?',
      [id]
    );

    return {
      mensaje: 'Operación de eliminación realizada',
      filas_afectadas: result.affectedRows
    };
  }
}
