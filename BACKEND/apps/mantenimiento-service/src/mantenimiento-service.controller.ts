import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MantenimientoServiceService } from './mantenimiento-service.service';

@Controller()
export class MantenimientoServiceController {
  constructor(
    private readonly mantenimientoServiceService: MantenimientoServiceService,
  ) {}

  @MessagePattern({ cmd: 'mantenimiento.saludo' })
  getHello(): string {
    return this.mantenimientoServiceService.getHello();
  }

  @MessagePattern({ cmd: 'mantenimiento.listar' })
  listarMantenimientos() {
    return this.mantenimientoServiceService.listarMantenimientos();
  }

  @MessagePattern({ cmd: 'mantenimiento.equipos.activos' })
  listarEquiposActivos() {
    return this.mantenimientoServiceService.listarEquiposActivos();
  }

  @MessagePattern({ cmd: 'mantenimiento.responsables.activos' })
  listarResponsablesActivos() {
    return this.mantenimientoServiceService.listarResponsablesActivos();
  }

  @MessagePattern({ cmd: 'mantenimiento.incidencias.listar' })
  listarIncidencias() {
    return this.mantenimientoServiceService.listarIncidencias();
  }

  @MessagePattern({ cmd: 'mantenimiento.registrar' })
  crearMantenimiento(datos: {
    id_equipo: number;
    id_responsable: number;
    fecha_programada: string;
    tipo_mantenimiento: string;
    descripcion?: string;
    costo?: number | null;
    estado: string;
  }) {
    return this.mantenimientoServiceService.crearMantenimiento(datos);
  }
}