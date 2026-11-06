import { Test, TestingModule } from '@nestjs/testing';
import { ProduccionServiceController } from './produccion-service.controller';
import { ProduccionServiceService } from './produccion-service.service';

describe('ProduccionServiceController', () => {
  let produccionServiceController: ProduccionServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProduccionServiceController],
      providers: [ProduccionServiceService],
    }).compile();

    produccionServiceController = app.get<ProduccionServiceController>(ProduccionServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(produccionServiceController.getHello()).toBe('Hello World!');
    });
  });
});
