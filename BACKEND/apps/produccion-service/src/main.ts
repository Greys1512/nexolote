import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ProduccionServiceModule } from './produccion-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ProduccionServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || '127.0.0.1',
        port: 3002,
      },
    },
  );

  await app.listen();
}

bootstrap().catch((error) => {
  console.error('Error al iniciar produccion-service:', error);
  process.exitCode = 1;
});
