
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CatalogoServiceService } from './catalogo-service.service';

@Controller()
export class CatalogoServiceController {
  constructor(
    private readonly catalogoServiceService: CatalogoServiceService,
  ) {}

  // CONSULTAR SALUDO
  @MessagePattern({ cmd: 'catalogo.saludo' })
  getHello(): string {
    return this.catalogoServiceService.getHello();
  }

  // CONSULTAR TODOS LOS PRODUCTOS
  @MessagePattern({ cmd: 'catalogo.productos.listar' })
  listarProductos() {
    return this.catalogoServiceService.listarProductos();
  }

  // REGISTRAR UN PRODUCTO
  @MessagePattern({ cmd: 'catalogo.productos.crear' })
  crearProducto(producto: {
    nombre: string;
    descripcion?: string;
    unidad_medida: string;
    estado: string;
  }) {
    return this.catalogoServiceService.crearProducto(producto);
  }

  // ACTUALIZAR UN PRODUCTO
  @MessagePattern({ cmd: 'catalogo.productos.actualizar' })
  actualizarProducto(data: {
    id_producto: number;
    producto: {
      nombre: string;
      descripcion?: string;
      unidad_medida: string;
      estado: string;
    };
  }) {
    return this.catalogoServiceService.actualizarProducto(
      data.id_producto,
      data.producto,
    );
  }

  // ELIMINAR UN PRODUCTO (ELIMINACIÓN LÓGICA)
  @MessagePattern({ cmd: 'catalogo.productos.eliminar' })
  eliminarProducto(data: {
    id_producto: number;
  }) {
    return this.catalogoServiceService.eliminarProducto(
      data.id_producto,
    );
  }
}
