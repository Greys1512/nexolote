import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { AuthController } from './auth.controller';
import { cargarEnv } from './env';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

cargarEnv();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRA = process.env.JWT_EXPIRA || '8h';

if (!JWT_SECRET) {
  throw new Error(
    'Falta JWT_SECRET en BACKEND/.env. Ejecuta: npm run jwt:generar',
  );
}

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRA as `${number}${'s' | 'm' | 'h' | 'd'}` },
    }),
    ClientsModule.register([
      {
        name: 'CATALOGO_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.CATALOGO_SERVICE_HOST || '127.0.0.1',
          port: 3001,
        },
      },
      {
        name: 'PRODUCCION_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.PRODUCCION_SERVICE_HOST || '127.0.0.1',
          port: 3002,
        },
      },
      {
        name: 'INVENTARIO_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.INVENTARIO_SERVICE_HOST || '127.0.0.1',
          port: 3003,
        },
      },
      {
        name: 'MANTENIMIENTO_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MANTENIMIENTO_SERVICE_HOST || '127.0.0.1',
          port: 3004,
        },
      },
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.AUTH_SERVICE_HOST || '127.0.0.1',
          port: 3005,
        },
      },
    ]),
  ],
  controllers: [ApiGatewayController, AuthController],
  providers: [
    ApiGatewayService,
    // Guard global: todo pide token salvo lo marcado con @Publico()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class ApiGatewayModule {}
