import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthServiceService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

  @MessagePattern({ cmd: 'auth.login' }) login(data: { correo?: string; password?: string }) { return this.authService.login(data.correo, data.password); }
  @MessagePattern({ cmd: 'auth.usuario.por-id' }) obtenerUsuarioPorId(id_usuario: number) { return this.authService.obtenerUsuarioPorId(id_usuario); }
  @MessagePattern({ cmd: 'auth.usuarios.listar' }) listarUsuarios() { return this.authService.listarUsuarios(); }
  @MessagePattern({ cmd: 'auth.usuarios.crear' }) crearUsuario(usuario: { nombre: string; correo: string; password?: string; rol: string; estado: string }) { return this.authService.crearUsuario(usuario); }
  @MessagePattern({ cmd: 'auth.usuarios.actualizar' }) actualizarUsuario(data: { id_usuario: number; usuario: { nombre: string; correo: string; password?: string; rol: string; estado: string } }) { return this.authService.actualizarUsuario(data.id_usuario, data.usuario); }
  @MessagePattern({ cmd: 'auth.usuarios.eliminar' }) eliminarUsuario(data: { id_usuario: number }) { return this.authService.eliminarUsuario(data.id_usuario); }
}
