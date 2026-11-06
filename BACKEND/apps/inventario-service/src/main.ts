import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { InventarioServiceModule } from './inventario-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventarioServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || '127.0.0.1',
        port: 3003,
      },
    },
  );

  await app.listen();
}

bootstrap().catch((error) => {
  console.error('Error al iniciar inventario-service:', error);
  process.exitCode = 1;
});
