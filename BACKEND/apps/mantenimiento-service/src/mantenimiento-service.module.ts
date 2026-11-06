import { Module } from '@nestjs/common';
import { MantenimientoServiceController } from './mantenimiento-service.controller';
import { MantenimientoServiceService } from './mantenimiento-service.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MantenimientoServiceController],
  providers: [MantenimientoServiceService],
})
export class MantenimientoServiceModule {}