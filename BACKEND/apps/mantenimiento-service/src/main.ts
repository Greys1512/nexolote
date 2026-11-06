import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { MantenimientoServiceModule } from './mantenimiento-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MantenimientoServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || '127.0.0.1',
        port: 3004,
      },
    },
  );

  await app.listen();
}

bootstrap().catch((error) => {
  console.error('Error al iniciar mantenimiento-service:', error);
  process.exitCode = 1;
});
