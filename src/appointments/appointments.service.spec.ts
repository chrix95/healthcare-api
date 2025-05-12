import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Queue } from 'bull';
import { Readable } from 'stream';
import * as csv from 'csv-parser';
import { Appointment } from './entities/appointment.entity';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let appointmentModel: Model<Appointment>;
  let appointmentsQueue: Queue;

  const mockAppointment = {
    id: 1,
    patient_id: 1,
    doctor: 'Dr. Smith',
    appointment_date: new Date(),
  };

  const mockFile = {
    originalname: 'test.csv',
    buffer: Buffer.from('id,patient_id,doctor,appointment_date\n1,1,Dr. Smith,2023-01-01'),
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getModelToken(Appointment.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: 'BullQueue_appointments',
          useValue: {
            add: jest.fn(),
            on: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    appointmentModel = module.get<Model<Appointment>>(getModelToken(Appointment.name));
    appointmentsQueue = module.get<Queue>('BullQueue_appointments');
  });

  describe('findAll', () => {
    it('should return all appointments when no filters provided', async () => {
      jest.spyOn(appointmentModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockAppointment]),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual([mockAppointment]);
      expect(appointmentModel.find).toHaveBeenCalledWith({});
    });

    it('should filter by patient_id when provided', async () => {
      const patientId = 1;
      jest.spyOn(appointmentModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockAppointment]),
      } as any);

      const result = await service.findAll(patientId);
      expect(result).toEqual([mockAppointment]);
      expect(appointmentModel.find).toHaveBeenCalledWith({ patient_id: patientId });
    });

    it('should filter by doctor when provided', async () => {
      const doctor = 'Dr. Smith';
      jest.spyOn(appointmentModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockAppointment]),
      } as any);

      const result = await service.findAll(undefined, doctor);
      expect(result).toEqual([mockAppointment]);
      expect(appointmentModel.find).toHaveBeenCalledWith({ doctor });
    });

    it('should combine filters when both provided', async () => {
      const patientId = 1;
      const doctor = 'Dr. Smith';
      jest.spyOn(appointmentModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockAppointment]),
      } as any);

      const result = await service.findAll(patientId, doctor);
      expect(result).toEqual([mockAppointment]);
      expect(appointmentModel.find).toHaveBeenCalledWith({ 
        patient_id: patientId, 
        doctor 
      });
    });
  });

  describe('findOne', () => {
    it('should return an appointment by id', async () => {
      jest.spyOn(appointmentModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAppointment),
      } as any);

      const result = await service.findOne(1);
      expect(result).toEqual(mockAppointment);
      expect(appointmentModel.findOne).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null when appointment not found', async () => {
      jest.spyOn(appointmentModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('parseCsv', () => {
    it('should parse CSV data correctly', async () => {
      const csvData = 'id,patient_id,doctor\n1,1,Dr. Smith';
      const buffer = Buffer.from(csvData);
      
      const result = await service['parseCsv'](buffer);
      expect(result).toEqual([{
        id: '1',
        patient_id: '1',
        doctor: 'Dr. Smith'
      }]);
    });

    it('should return empty array for invalid CSV data', async () => {
      const invalidCsv = 'invalid,csv,data';
      const buffer = Buffer.from(invalidCsv);
      
      const result = await service['parseCsv'](buffer);
      expect(result).toEqual([]);
    });
  });

  describe('processAppointmentsFile', () => {
    it('should process a valid CSV file', async () => {
      jest.spyOn(service as any, 'parseCsv').mockResolvedValue([mockAppointment]);
      jest.spyOn(appointmentsQueue, 'add').mockResolvedValue({ id: 'job1' } as any);

      const result = await service.processAppointmentsFile(mockFile);
      expect(result).toEqual({
        jobId: 'job1',
        file: 'test.csv',
        records: 1
      });
      expect(appointmentsQueue.add).toHaveBeenCalledWith(
        'process-csv',
        { appointments: [mockAppointment] },
        { attempts: 3, removeOnComplete: true }
      );
    });

    it('should throw error for invalid file upload', async () => {
      await expect(service.processAppointmentsFile({} as Express.Multer.File))
        .rejects.toThrow('Invalid file upload');
    });

    it('should handle CSV parsing errors', async () => {
      jest.spyOn(service as any, 'parseCsv').mockRejectedValue(new Error('CSV error'));
      
      await expect(service.processAppointmentsFile(mockFile))
        .rejects.toThrow('CSV error');
    });

    it('should handle queue errors', async () => {
      jest.spyOn(service as any, 'parseCsv').mockResolvedValue([mockAppointment]);
      jest.spyOn(appointmentsQueue, 'add').mockRejectedValue(new Error('Queue error'));

      await expect(service.processAppointmentsFile(mockFile))
        .rejects.toThrow('Queue error');
    });
  });

  describe('queue event listeners', () => {
    it('should set up queue event listeners on initialization', () => {
      expect(appointmentsQueue.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(appointmentsQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
      expect(appointmentsQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
      expect(appointmentsQueue.on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });
});
