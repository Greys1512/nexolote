import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ProductosModule } from './productos/productos.module';

@Module({
  imports: [
    DatabaseModule,
    ProductosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}