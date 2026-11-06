import { Module } from '@nestjs/common';
import { CatalogoServiceController } from './catalogo-service.controller';
import { CatalogoServiceService } from './catalogo-service.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CatalogoServiceController],
  providers: [CatalogoServiceService],
})
export class CatalogoServiceModule {}
