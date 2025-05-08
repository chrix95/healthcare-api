import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../entities/appointment.entity';
import * as csv from 'csv-parser';
import * as fs from 'fs';

@Processor('appointments')
export class AppointmentsProcessor {
  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<Appointment>,
  ) {}

  @Process('process-csv')
  async processCsv(job: Job<{ filepath: string }>) {
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(job.data.filepath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const appointments = results.map((item) => ({
              patient_id: parseInt(item.patient_id),
              doctor: item.doctor,
              appointment_date: new Date(item.appointment_date),
              reason: item.reason,
            }));

            await this.appointmentModel.insertMany(appointments);
            resolve(`Processed ${appointments.length} appointments`);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }
}
