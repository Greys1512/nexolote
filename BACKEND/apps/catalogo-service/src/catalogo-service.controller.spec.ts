
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogoServiceController } from './catalogo-service.controller';
import { CatalogoServiceService } from './catalogo-service.service';

describe('CatalogoServiceController', () => {
  let catalogoServiceController: CatalogoServiceController;

  const catalogoServiceMock = {
    getHello: jest.fn().mockReturnValue('Hello World!'),
    listarProductos: jest.fn(),
    crearProducto: jest.fn(),
    actualizarProducto: jest.fn(),
    eliminarProducto: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CatalogoServiceController],
      providers: [
        {
          provide: CatalogoServiceService,
          useValue: catalogoServiceMock,
        },
      ],
    }).compile();

    catalogoServiceController = app.get<CatalogoServiceController>(
      CatalogoServiceController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(catalogoServiceController.getHello()).toBe('Hello World!');
      expect(catalogoServiceMock.getHello).toHaveBeenCalled();
    });
  });
});
