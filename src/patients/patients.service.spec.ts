import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from './entities/patient.entity';
import { SequenceService } from '../common/sequence/sequence.service';
import { CreatePatientDto } from './dto/create-patient.dto';

describe('PatientsService', () => {
  let service: PatientsService;
  let patientModel: Model<Patient>;
  let sequenceService: SequenceService;

  const mockCreatePatientDto: CreatePatientDto = {
    name: 'John Doe',
    age: 23,
    gender: 'male',
    contact: '+1234567890',
  };

  beforeEach(async () => {
    // Create a mock model with proper typing
    const mockModel = function(data: any) {
      return {
        ...data,
        save: jest.fn().mockImplementation(function() {
          return Promise.resolve(this);
        })
      };
    };

    // Add query methods with proper chaining
    mockModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([])
    });
    
    mockModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null)
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: getModelToken(Patient.name),
          useValue: mockModel,
        },
        {
          provide: SequenceService,
          useValue: {
            getNextSequence: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    patientModel = module.get<Model<Patient>>(getModelToken(Patient.name));
    sequenceService = module.get<SequenceService>(SequenceService);
  });

  describe('create()', () => {
    it('should create a new patient with sequential ID', async () => {
      jest.spyOn(sequenceService, 'getNextSequence').mockResolvedValue(1);
      
      const result = await service.create(mockCreatePatientDto);
      
      expect(sequenceService.getNextSequence).toHaveBeenCalledWith('patientId');
      expect(result).toEqual(expect.objectContaining({
        patientId: 1,
        ...mockCreatePatientDto
      }));
    });

    it('should throw error when save fails', async () => {
      // Create a new mock model just for this test
      const mockModel = function(data: any) {
        return {
          ...data,
          save: jest.fn().mockRejectedValue(new Error('Save failed'))
        };
      };

      // Maintain the same query interface
      mockModel.find = patientModel.find;
      mockModel.findOne = patientModel.findOne;

      const tempModule: TestingModule = await Test.createTestingModule({
        providers: [
          PatientsService,
          {
            provide: getModelToken(Patient.name),
            useValue: mockModel,
          },
          {
            provide: SequenceService,
            useValue: {
              getNextSequence: jest.fn().mockResolvedValue(1),
            },
          },
        ],
      }).compile();

      const tempService = tempModule.get<PatientsService>(PatientsService);

      await expect(tempService.create(mockCreatePatientDto))
        .rejects.toThrow('Save failed');
    });

    // ... other test cases ...
  });

  describe('findAll()', () => {
    it('should return an array of patients', async () => {
      const mockPatients = [{
        patientId: 1,
        ...mockCreatePatientDto
      }];
      
      (patientModel.find as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPatients)
      });

      const result = await service.findAll();
      expect(result).toEqual(mockPatients);
    });
  });

  describe('findOne()', () => {
    it('should return a patient by id', async () => {
      const mockPatient = {
        patientId: 1,
        ...mockCreatePatientDto
      };

      (patientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPatient)
      });

      const result = await service.findOne(1);
      expect(result).toEqual(mockPatient);
    });
  });
});