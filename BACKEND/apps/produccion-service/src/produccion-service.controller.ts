
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProduccionServiceService } from './produccion-service.service';

@Controller()
export class ProduccionServiceController {
  constructor(
    private readonly produccionServiceService: ProduccionServiceService,
  ) {}

  // VERIFICAR MICROSERVICIO
  @MessagePattern({ cmd: 'produccion.saludo' })
  getHello(): string {
    return this.produccionServiceService.getHello();
  }

  // CONSULTAR LOTES DE PRODUCCIÓN
  @MessagePattern({ cmd: 'produccion.lotes.listar' })
  listarLotes() {
    return this.produccionServiceService.listarLotes();
  }

  // CONSULTAR PRODUCTOS ACTIVOS
  @MessagePattern({ cmd: 'produccion.productos.activos' })
  listarProductosActivos() {
    return this.produccionServiceService.listarProductosActivos();
  }

  // CONSULTAR RESPONSABLES ACTIVOS
  @MessagePattern({ cmd: 'produccion.responsables.activos' })
  listarResponsablesActivos() {
    return this.produccionServiceService.listarResponsablesActivos();
  }

  // REGISTRAR UN LOTE
  @MessagePattern({ cmd: 'produccion.lotes.crear' })
  crearLote(lote: {
    codigo_lote: string;
    id_producto: number;
    id_responsable: number;
    fecha_produccion: string;
    fecha_vencimiento?: string | null;
    cantidad_producida: number;
    estado: string;
  }) {
    return this.produccionServiceService.crearLote(lote);
  }

  // ACTUALIZAR UN LOTE
  @MessagePattern({ cmd: 'produccion.lotes.actualizar' })
  actualizarLote(data: {
    id_lote: number;
    lote: {
      codigo_lote: string;
      id_producto: number;
      id_responsable: number;
      fecha_produccion: string;
      fecha_vencimiento?: string | null;
      cantidad_producida: number;
      estado: string;
    };
  }) {
    return this.produccionServiceService.actualizarLote(
      data.id_lote,
      data.lote,
    );
  }

  // CANCELAR UN LOTE (ELIMINACIÓN LÓGICA)
  @MessagePattern({ cmd: 'produccion.lotes.cancelar' })
  cancelarLote(data: { id_lote: number }) {
    return this.produccionServiceService.cancelarLote(
      data.id_lote,
    );
  }
}
