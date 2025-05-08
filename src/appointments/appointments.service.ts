import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<Appointment>,
    @InjectQueue('appointments')
    private appointmentsQueue: Queue,
  ) {}

  async findAll(patientId?: number, doctor?: string): Promise<Appointment[]> {
    const filter: any = {};
    if (patientId) filter.patient_id = patientId;
    if (doctor) filter.doctor = doctor;

    return this.appointmentModel.find(filter).exec();
  }

  async findOne(id: number): Promise<Appointment | null> {
    return this.appointmentModel.findOne({ id }).exec();
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const nextId = await this.getNextSequence('appointmentId');
    const createdAppointment = new this.appointmentModel({
      id: nextId,
      ...createAppointmentDto,
    });
    return createdAppointment.save();
  }

  private async getNextSequence(name: string): Promise<number> {
    const result = await this.appointmentModel.db
      .collection('counters')
      .findOneAndUpdate(
        { _id: name as any },
        { $inc: { sequence_value: 1 } },
        { returnDocument: 'after', upsert: true },
      );
    return result.sequence_value || 1;
  }
}
