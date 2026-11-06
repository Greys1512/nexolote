import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { Publico } from './auth/publico.decorator';

interface UsuarioLogueado {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  // INICIAR SESIÓN -> devuelve el token JWT
  @Publico()
  @Post('login')
  async login(
    @Body() body: { correo?: string; password?: string },
  ): Promise<{ token: string; usuario: Omit<UsuarioLogueado, 'estado'> }> {
    const resultado = await firstValueFrom(
      this.authClient.send(
        { cmd: 'auth.login' },
        { correo: body?.correo, password: body?.password },
      ),
    );

    if (!resultado?.exito) {
      throw new UnauthorizedException(
        resultado?.mensaje || 'Correo o contraseña incorrectos.',
      );
    }

    const usuario: UsuarioLogueado = resultado.usuario;

    const token = await this.jwtService.signAsync({
      sub: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    });

    // Nunca devolvemos el estado interno ni el hash
    const { estado: _estado, ...seguro } = usuario;
    return { token, usuario: seguro };
  }

  // PERFIL DEL USUARIO DEL TOKEN (protegido)
  @Get('perfil')
  async perfil(@Req() req: Request & { user?: { sub?: number } }) {
    const idUsuario = req.user?.sub;

    if (!idUsuario) {
      throw new UnauthorizedException('Token inválido.');
    }

    const resultado = await firstValueFrom(
      this.authClient.send({ cmd: 'auth.usuario.por-id' }, idUsuario),
    );

    if (!resultado?.exito) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    return resultado.usuario;
  }
}
