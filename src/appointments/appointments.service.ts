import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './entities/appointment.entity';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<Appointment>,
    @InjectQueue('appointments')
    private readonly appointmentsQueue: Queue,
  ) {
    this.appointmentsQueue.on('ready', () => {
      console.log('Queue is ready');
    });
    this.appointmentsQueue.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });
    
    this.appointmentsQueue.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err);
    });
    
    this.appointmentsQueue.on('error', (err) => {
      console.error('Queue error:', err);
    });
  }

  async findAll(patientId?: number, doctor?: string): Promise<Appointment[]> {
    const filter: any = {};
    if (patientId) filter.patient_id = patientId;
    if (doctor) filter.doctor = doctor;

    return this.appointmentModel.find(filter).exec();
  }

  async findOne(id: number): Promise<Appointment | null> {
    return this.appointmentModel.findOne({ id }).exec();
  }

  private parseCsv(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from(buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  async processAppointmentsFile(file: Express.Multer.File) {
    if (!file?.buffer) throw new Error('Invalid file upload');

    try {
      // Parse CSV directly from buffer
      const appointments = await this.parseCsv(file.buffer);

      const job = await this.appointmentsQueue.add('process-csv', {
        appointments
      }, {
        attempts: 3,
        removeOnComplete: true,
      });
  
      return { 
        jobId: job.id,
        file: file.originalname,
        records: appointments.length
      };
    } catch (error) {
      throw error;
    }
  }
}
