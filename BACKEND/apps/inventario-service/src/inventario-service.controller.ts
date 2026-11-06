import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InventarioServiceService } from './inventario-service.service';

@Controller()
export class InventarioServiceController {
  constructor(
    private readonly inventarioServiceService: InventarioServiceService,
  ) {}

  // VERIFICAR MICROSERVICIO
  @MessagePattern({ cmd: 'inventario.saludo' })
  getHello() {
    return this.inventarioServiceService.getHello();
  }

  // DASHBOARD
  @MessagePattern({ cmd: 'inventario.dashboard' })
  obtenerDashboard() {
    return this.inventarioServiceService.obtenerDashboard();
  }

  // MATERIAS PRIMAS
  @MessagePattern({ cmd: 'inventario.materias-primas.listar' })
  listarMateriasPrimas() {
    return this.inventarioServiceService.listarMateriasPrimas();
  }

  // LOTES DE MATERIAS PRIMAS
  @MessagePattern({ cmd: 'inventario.lotes-materia-prima.listar' })
  listarLotesMateriaPrima() {
    return this.inventarioServiceService.listarLotesMateriaPrima();
  }

  // PROVEEDORES PARA EL FORMULARIO
  @MessagePattern({ cmd: 'inventario.proveedores.listar' })
  listarProveedores() {
    return this.inventarioServiceService.listarProveedores();
  }

  // UBICACIONES PARA EL FORMULARIO
  @MessagePattern({ cmd: 'inventario.ubicaciones.listar' })
  listarUbicaciones() {
    return this.inventarioServiceService.listarUbicaciones();
  }

  // REGISTRAR ENTRADA DE MATERIA PRIMA
  @MessagePattern({ cmd: 'inventario.entrada.registrar' })
  registrarEntrada(datos: {
    id_materia_prima: number;
    id_proveedor: number;
    id_ubicacion: number;
    fecha_recepcion: string;
    fecha_vencimiento?: string | null;
    cantidad_recibida: number;
  }) {
    return this.inventarioServiceService.registrarEntrada(datos);
  }
}