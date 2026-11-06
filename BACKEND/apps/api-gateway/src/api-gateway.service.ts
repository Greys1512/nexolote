import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject('CATALOGO_SERVICE') private readonly catalogoClient: ClientProxy,
    @Inject('PRODUCCION_SERVICE') private readonly produccionClient: ClientProxy,
    @Inject('INVENTARIO_SERVICE') private readonly inventarioClient: ClientProxy,
    @Inject('MANTENIMIENTO_SERVICE') private readonly mantenimientoClient: ClientProxy,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  getHello(): string { return 'API Gateway funcionando correctamente'; }

  // CATÁLOGO
  async catalogoSaludo() { return firstValueFrom(this.catalogoClient.send({ cmd: 'catalogo.saludo' }, {})); }
  async listarProductos() { return firstValueFrom(this.catalogoClient.send({ cmd: 'catalogo.productos.listar' }, {})); }
  async crearProducto(producto: { nombre: string; descripcion?: string; unidad_medida: string; estado: string }) { return firstValueFrom(this.catalogoClient.send({ cmd: 'catalogo.productos.crear' }, producto)); }
  async actualizarProducto(id_producto: number, producto: { nombre: string; descripcion?: string; unidad_medida: string; estado: string }) { return firstValueFrom(this.catalogoClient.send({ cmd: 'catalogo.productos.actualizar' }, { id_producto, producto })); }
  async eliminarProducto(id_producto: number) { return firstValueFrom(this.catalogoClient.send({ cmd: 'catalogo.productos.eliminar' }, { id_producto })); }

  // PRODUCCIÓN
  async produccionSaludo() { return firstValueFrom(this.produccionClient.send({ cmd: 'produccion.saludo' }, {})); }
  async listarLotes() { return firstValueFrom(this.produccionClient.send({ cmd: 'produccion.lotes.listar' }, {})); }
  async listarProductosProduccion() { return firstValueFrom(this.produccionClient.send({ cmd: 'produccion.productos.activos' }, {})); }
  async listarResponsablesProduccion() { return firstValueFrom(this.produccionClient.send({ cmd: 'produccion.responsables.activos' }, {})); }
  async crearLote(lote: { codigo_lote: string; id_producto: number; id_responsable: number; fecha_produccion: string; fecha_vencimiento?: string | null; cantidad_producida: number; estado: string }) { return firstValueFrom(this.produccionClient.send({ cmd: 'produccion.lotes.crear' }, lote)); }

  // INVENTARIO
  async inventarioSaludo() { return firstValueFrom(this.inventarioClient.send({ cmd: 'inventario.saludo' }, {})); }
  async obtenerDashboardInventario() { return firstValueFrom(this.inventarioClient.send({ cmd: 'inventario.dashboard' }, {})); }
  async listarMateriasPrimas() { return firstValueFrom(this.inventarioClient.send({ cmd: 'inventario.materias-primas.listar' }, {})); }
  async listarLotesMateriaPrima() { return firstValueFrom(this.inventarioClient.send({ cmd: 'inventario.lotes-materia-prima.listar' }, {})); }
  async listarProveedoresInventario() { return firstValueFrom(this.inventarioClient.send({ cmd: 'inventario.proveedores.listar' }, {})); }
  async listarUbicacionesInventario() { return firstValueFrom(this.inventarioClient.send({ cmd: 'inventario.ubicaciones.listar' }, {})); }
  async registrarEntradaMateriaPrima(datos: { id_materia_prima: number; id_proveedor: number; id_ubicacion: number; fecha_recepcion: string; fecha_vencimiento?: string | null; cantidad_recibida: number }) { return firstValueFrom(this.inventarioClient.send({ cmd: 'inventario.entrada.registrar' }, datos)); }

  // MANTENIMIENTO
  async mantenimientoSaludo() { return firstValueFrom(this.mantenimientoClient.send({ cmd: 'mantenimiento.saludo' }, {})); }
  async listarMantenimientos() { return firstValueFrom(this.mantenimientoClient.send({ cmd: 'mantenimiento.listar' }, {})); }
  async listarEquiposMantenimiento() { return firstValueFrom(this.mantenimientoClient.send({ cmd: 'mantenimiento.equipos.activos' }, {})); }
  async listarResponsablesMantenimiento() { return firstValueFrom(this.mantenimientoClient.send({ cmd: 'mantenimiento.responsables.activos' }, {})); }
  async listarIncidencias() { return firstValueFrom(this.mantenimientoClient.send({ cmd: 'mantenimiento.incidencias.listar' }, {})); }
  async crearMantenimiento(datos: { id_equipo: number; id_responsable: number; fecha_programada: string; tipo_mantenimiento: string; descripcion?: string; costo?: number | null; estado: string }) { return firstValueFrom(this.mantenimientoClient.send({ cmd: 'mantenimiento.registrar' }, datos)); }

  // USUARIOS
  async listarUsuarios() { return firstValueFrom(this.authClient.send({ cmd: 'auth.usuarios.listar' }, {})); }
  async crearUsuario(usuario: { nombre: string; correo: string; password?: string; rol: string; estado: string }) { return firstValueFrom(this.authClient.send({ cmd: 'auth.usuarios.crear' }, usuario)); }
  async actualizarUsuario(id_usuario: number, usuario: { nombre: string; correo: string; password?: string; rol: string; estado: string }) { return firstValueFrom(this.authClient.send({ cmd: 'auth.usuarios.actualizar' }, { id_usuario, usuario })); }
  async eliminarUsuario(id_usuario: number) { return firstValueFrom(this.authClient.send({ cmd: 'auth.usuarios.eliminar' }, { id_usuario })); }
}
