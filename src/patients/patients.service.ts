import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { SequenceService } from '../common/sequence/sequence.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name) private patientModel: Model<Patient>,
    private readonly sequenceService: SequenceService,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const nextId = await this.sequenceService.getNextSequence('patientId');
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
}
