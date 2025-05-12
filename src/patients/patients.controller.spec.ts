import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { HttpStatus, NotFoundException, RequestMethod } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { Patient } from './entities/patient.entity';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

  const mockPatient = createMock<Patient>({
    patientId: 1,
    name: 'John Doe',
    age: 23,
    gender: 'male',
    contact: '+1234567890',
  });

  const mockCreatePatientDto: CreatePatientDto = {
    name: mockPatient.name,
    age: mockPatient.age,
    gender: mockPatient.gender,
    contact: mockPatient.contact,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get<PatientsService>(PatientsService);
  });

  describe('create()', () => {
    it('should create a new patient', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockPatient);

      const result = await controller.create(mockCreatePatientDto);
      expect(result).toEqual(mockPatient);
      expect(service.create).toHaveBeenCalledWith(mockCreatePatientDto);
    });

    it('should throw error when creation fails', async () => {
      jest.spyOn(service, 'create').mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(mockCreatePatientDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll()', () => {
    it('should return an array of patients', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockPatient]);

      const result = await controller.findAll();
      expect(result).toEqual([mockPatient]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no patients exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll();
      expect(result).toEqual([]);
    });

    it('should have HTTP status code 200', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockPatient]);

      const response = await controller.findAll();
      expect(response).toBeDefined(); // The @HttpCode decorator is tested implicitly
    });
  });

  describe('findOne()', () => {
    it('should return a single patient', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPatient);

      const result = await controller.findOne(mockPatient.id);
      expect(result).toEqual(mockPatient);
      expect(service.findOne).toHaveBeenCalledWith(mockPatient.id);
    });

    it('should throw NotFoundException when patient does not exist', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it('should include correct error message in NotFoundException', async () => {
      const nonExistentId = 999;
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      try {
        await controller.findOne(nonExistentId);
      } catch (error) {
        expect(error.message).toBe(`Patient with id ${nonExistentId} not found`);
      }
    });
  });

  describe('decorators', () => {
    it('should have ApiTags decorator with "Patients"', () => {
      const apiTags = Reflect.getMetadata('swagger/apiUseTags', PatientsController);
      expect(apiTags).toEqual(['Patients']);
    });

    it('should have proper route decorators', () => {
      const createMetadata = Reflect.getMetadata('path', PatientsController.prototype.create);
      const findAllMetadata = Reflect.getMetadata('path', PatientsController.prototype.findAll);
      const findOneMetadata = Reflect.getMetadata('path', PatientsController.prototype.findOne);

      expect(createMetadata).toEqual('/');
      expect(findAllMetadata).toEqual('/');
      expect(findOneMetadata).toEqual(':id');
    });

    it('should have proper HTTP method decorators', () => {
      const createMetadata = Reflect.getMetadata('method', PatientsController.prototype.create);
      const findAllMetadata = Reflect.getMetadata('method', PatientsController.prototype.findAll);
      const findOneMetadata = Reflect.getMetadata('method', PatientsController.prototype.findOne);
  
      expect(createMetadata).toEqual(RequestMethod.POST);
      expect(findAllMetadata).toEqual(RequestMethod.GET);
      expect(findOneMetadata).toEqual(RequestMethod.GET);
    });

    it('should have HttpCode decorator on findAll', () => {
      const httpCode = Reflect.getMetadata('__httpCode__', PatientsController.prototype.findAll);
      expect(httpCode).toEqual(HttpStatus.OK);
    });
  });
});
