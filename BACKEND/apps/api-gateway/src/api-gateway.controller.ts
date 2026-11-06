import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { Publico } from './auth/publico.decorator';
import { Roles } from './auth/roles.decorator';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Publico() @Get() getHello(): string { return this.apiGatewayService.getHello(); }
  @Publico() @Get('catalogo/saludo') catalogoSaludo() { return this.apiGatewayService.catalogoSaludo(); }
  @Get('catalogo/productos') listarProductos() { return this.apiGatewayService.listarProductos(); }
  @Post('catalogo/productos') crearProducto(@Body() p: { nombre: string; descripcion?: string; unidad_medida: string; estado: string }) { return this.apiGatewayService.crearProducto(p); }
  @Put('catalogo/productos/:id') actualizarProducto(@Param('id') id: string, @Body() p: { nombre: string; descripcion?: string; unidad_medida: string; estado: string }) { return this.apiGatewayService.actualizarProducto(Number(id), p); }
  @Delete('catalogo/productos/:id') eliminarProducto(@Param('id') id: string) { return this.apiGatewayService.eliminarProducto(Number(id)); }

  @Get('produccion/saludo') produccionSaludo() { return this.apiGatewayService.produccionSaludo(); }
  @Get('produccion/lotes') listarLotes() { return this.apiGatewayService.listarLotes(); }
  @Get('produccion/productos') listarProductosProduccion() { return this.apiGatewayService.listarProductosProduccion(); }
  @Get('produccion/responsables') listarResponsablesProduccion() { return this.apiGatewayService.listarResponsablesProduccion(); }
  @Post('produccion/lotes') crearLote(@Body() l: { codigo_lote: string; id_producto: number; id_responsable: number; fecha_produccion: string; fecha_vencimiento?: string | null; cantidad_producida: number; estado: string }) { return this.apiGatewayService.crearLote(l); }

  @Get('inventario/saludo') inventarioSaludo() { return this.apiGatewayService.inventarioSaludo(); }
  @Get('inventario/dashboard') obtenerDashboardInventario() { return this.apiGatewayService.obtenerDashboardInventario(); }
  @Get('inventario/materias-primas') listarMateriasPrimas() { return this.apiGatewayService.listarMateriasPrimas(); }
  @Get('inventario/lotes-materia-prima') listarLotesMateriaPrima() { return this.apiGatewayService.listarLotesMateriaPrima(); }
  @Get('inventario/proveedores') listarProveedoresInventario() { return this.apiGatewayService.listarProveedoresInventario(); }
  @Get('inventario/ubicaciones') listarUbicacionesInventario() { return this.apiGatewayService.listarUbicacionesInventario(); }
  @Post('inventario/entrada') registrarEntrada(@Body() d: { id_materia_prima: number; id_proveedor: number; id_ubicacion: number; fecha_recepcion: string; fecha_vencimiento?: string | null; cantidad_recibida: number }) { return this.apiGatewayService.registrarEntradaMateriaPrima(d); }

  @Get('mantenimiento/saludo') mantenimientoSaludo() { return this.apiGatewayService.mantenimientoSaludo(); }
  @Get('mantenimiento/registros') listarMantenimientos() { return this.apiGatewayService.listarMantenimientos(); }
  @Get('mantenimiento/equipos') listarEquiposMantenimiento() { return this.apiGatewayService.listarEquiposMantenimiento(); }
  @Get('mantenimiento/responsables') listarResponsablesMantenimiento() { return this.apiGatewayService.listarResponsablesMantenimiento(); }
  @Get('mantenimiento/incidencias') listarIncidencias() { return this.apiGatewayService.listarIncidencias(); }
  @Post('mantenimiento/registros') crearMantenimiento(@Body() d: { id_equipo: number; id_responsable: number; fecha_programada: string; tipo_mantenimiento: string; descripcion?: string; costo?: number | null; estado: string }) { return this.apiGatewayService.crearMantenimiento(d); }

  @Roles('Administrador') @Get('usuarios') listarUsuarios() { return this.apiGatewayService.listarUsuarios(); }
  @Roles('Administrador') @Post('usuarios') crearUsuario(@Body() u: { nombre: string; correo: string; password?: string; rol: string; estado: string }) { return this.apiGatewayService.crearUsuario(u); }
  @Roles('Administrador') @Put('usuarios/:id') actualizarUsuario(@Param('id') id: string, @Body() u: { nombre: string; correo: string; password?: string; rol: string; estado: string }) { return this.apiGatewayService.actualizarUsuario(Number(id), u); }
  @Roles('Administrador') @Delete('usuarios/:id') eliminarUsuario(@Param('id') id: string) { return this.apiGatewayService.eliminarUsuario(Number(id)); }
}
