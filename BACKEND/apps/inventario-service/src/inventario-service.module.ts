
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { InventarioServiceController } from './inventario-service.controller';
import { InventarioServiceService } from './inventario-service.service';

@Module({
  imports: [DatabaseModule],
  controllers: [InventarioServiceController],
  providers: [InventarioServiceService],
})
export class InventarioServiceModule {}
