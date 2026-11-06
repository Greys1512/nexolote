import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ES_PUBLICO_KEY } from './publico.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (esPublico) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = extraerToken(request);

    if (!token) {
      throw new UnauthorizedException(
        'Falta el token de autenticación. Inicia sesión nuevamente.',
      );
    }

    try {
      // verifyAsync lanza si la firma no coincide o si expiró
      const payload = await this.jwtService.verifyAsync(token);
      (request as Request & { user: unknown }).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException(
        'El token es inválido o expiró. Inicia sesión nuevamente.',
      );
    }
  }
}

function extraerToken(request: Request): string | undefined {
  const authHeader = request.headers.authorization;
  if (!authHeader) return undefined;

  const [tipo, token] = authHeader.split(' ');
  return tipo === 'Bearer' && token ? token : undefined;
}
