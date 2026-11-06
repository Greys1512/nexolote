import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  app.enableCors({
    origin: allowedOrigins,
  });

  const host = process.env.GATEWAY_HOST || '127.0.0.1';
  const port = Number(process.env.PORT || 3000);
  await app.listen(port, host);
  console.log(`API Gateway escuchando en http://${host}:${port}`);
}

bootstrap().catch((error) => {
  console.error('Error al iniciar el API Gateway:', error);
});
