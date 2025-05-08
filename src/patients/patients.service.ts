import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const nextId = await this.getNextSequence('patientId');
    const patient = new this.patientModel({
      patientId: nextId,
      ...createPatientDto,
    });
    return patient.save();
  }

  async findAll(): Promise<Patient[]> {
    return this.patientModel.find().exec();
  }

  async findOne(id: number): Promise<Patient | null> {
    return this.patientModel.findOne({ patientId: id }).exec();
  }

  private async getNextSequence(name: string): Promise<number> {
    const result = await this.patientModel.db
      .collection('counters')
      .findOneAndUpdate(
        { _id: name as any },
        { $inc: { sequence_value: 1 } },
        {
          upsert: true,
          returnDocument: 'after',
        },
      );

    return result.sequence_value || 1;
  }
}
