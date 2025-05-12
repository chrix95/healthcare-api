import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Appointment } from './entities/appointment.entity';
import { createMock } from '@golevelup/ts-jest';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  const mockAppointment = createMock<Appointment>({
    id: 1,
    patient_id: 1,
    doctor: 'Dr. Smith',
    reason: 'Checkup',
    appointment_date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockFile = {
    fieldname: 'filepath',
    originalname: 'test.csv',
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: Buffer.from('test'),
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            processAppointmentsFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of appointments', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockAppointment]);

      const result = await controller.findAll();
      expect(result).toEqual([mockAppointment]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter by patient_id when provided', async () => {
      const patientId = 1;
      jest.spyOn(service, 'findAll').mockResolvedValue([mockAppointment]);

      const result = await controller.findAll(patientId);
      expect(result).toEqual([mockAppointment]);
      expect(service.findAll).toHaveBeenCalledWith(patientId, undefined);
    });

    it('should filter by doctor when provided', async () => {
      const doctor = 'Dr. Smith';
      jest.spyOn(service, 'findAll').mockResolvedValue([mockAppointment]);

      const result = await controller.findAll(undefined, doctor);
      expect(result).toEqual([mockAppointment]);
      expect(service.findAll).toHaveBeenCalledWith(undefined, doctor);
    });

    it('should filter by both patient_id and doctor when provided', async () => {
      const patientId = 1;
      const doctor = 'Dr. Smith';
      jest.spyOn(service, 'findAll').mockResolvedValue([mockAppointment]);

      const result = await controller.findAll(patientId, doctor);
      expect(result).toEqual([mockAppointment]);
      expect(service.findAll).toHaveBeenCalledWith(patientId, doctor);
    });
  });

  describe('findOne', () => {
    it('should return a single appointment', async () => {
      const id = 1;
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAppointment);

      const result = await controller.findOne(id);
      expect(result).toEqual(mockAppointment);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when appointment not found', async () => {
      const id = 999;
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('processAppointments', () => {
    it('should process appointments file successfully', async () => {
      const mockResult = { jobId: 1, file: 'filepath', records: 3 };
      jest.spyOn(service, 'processAppointmentsFile').mockResolvedValue(mockResult);

      const result = await controller.processAppointments(mockFile);
      expect(result).toEqual({
        message: 'Appointments processing started',
        details: mockResult,
      });
      expect(service.processAppointmentsFile).toHaveBeenCalledWith(mockFile);
    });

    it('should throw error when no file is uploaded', async () => {
      await expect(controller.processAppointments(undefined)).rejects.toThrow('No file uploaded');
      expect(service.processAppointmentsFile).not.toHaveBeenCalled();
    });

    it('should handle file processing errors', async () => {
      const error = new Error('Processing failed');
      jest.spyOn(service, 'processAppointmentsFile').mockRejectedValue(error);

      await expect(controller.processAppointments(mockFile)).rejects.toThrow(error);
      expect(service.processAppointmentsFile).toHaveBeenCalledWith(mockFile);
    });
  });
});
