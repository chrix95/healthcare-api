import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from '../entities/appointment.entity';

@Processor('appointments')
export class AppointmentsProcessor {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<Appointment>,
  ) {}

  @Process('process-csv')
  async handleCsvProcessing(job: Job<{ appointments: any[] }>) {
    const { appointments } = job.data;
    
    try {
      // Get the next sequence value for appointments
      const nextId = await this.getNextSequence('appointmentId');

      // Transform and validate appointments
      const formattedAppointments = appointments.map((appointment, index) => ({
        id: nextId + index, // Assign sequential IDs
        patient_id: appointment.patient_id,
        doctor: appointment.doctor,
        appointment_date: new Date(appointment.appointment_date),
        reason: appointment.reason,
      }));

      // Insert into database
      await this.appointmentModel.insertMany(formattedAppointments);
    
      // Update sequence counter
      await this.updateSequence('appointmentId', nextId + appointments.length);
      
      return {
        success: true,
        count: formattedAppointments.length,
        firstId: nextId,
        lastId: nextId + appointments.length - 1
      };
    } catch (error) {
      throw error;
    }
  }

  private async getNextSequence(name: string): Promise<number> {
    const result = await this.appointmentModel.db
      .collection('counters')
      .findOneAndUpdate(
        { _id: name as any },
        { $inc: { sequence_value: 1 } },
        { upsert: true, returnDocument: 'after' }
      );
    return result.sequence_value || 1;
  }
  
  private async updateSequence(name: string, value: number): Promise<void> {
    await this.appointmentModel.db
      .collection('counters')
      .updateOne(
        { _id: name as any },
        { $set: { sequence_value: value } },
        { upsert: true }
      );
  }
}
