import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { CatalogoServiceModule } from './catalogo-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogoServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || '127.0.0.1',
        port: 3001,
      },
    },
  );

  await app.listen();
}

bootstrap().catch((error) => {
  console.error('Error al iniciar catalogo-service:', error);
  process.exitCode = 1;
});
