import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProduccionServiceController } from './produccion-service.controller';
import { ProduccionServiceService } from './produccion-service.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProduccionServiceController],
  providers: [ProduccionServiceService],
})
export class ProduccionServiceModule {}