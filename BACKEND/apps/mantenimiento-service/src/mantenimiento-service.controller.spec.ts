import { Test, TestingModule } from '@nestjs/testing';
import { MantenimientoServiceController } from './mantenimiento-service.controller';
import { MantenimientoServiceService } from './mantenimiento-service.service';

describe('MantenimientoServiceController', () => {
  let mantenimientoServiceController: MantenimientoServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MantenimientoServiceController],
      providers: [MantenimientoServiceService],
    }).compile();

    mantenimientoServiceController = app.get<MantenimientoServiceController>(MantenimientoServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mantenimientoServiceController.getHello()).toBe('Hello World!');
    });
  });
});
