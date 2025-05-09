import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './entities/patient.entity';
import { BullModule } from '@nestjs/bull';
import { SequenceService } from '../common/sequence/sequence.service';
import { Counter, CounterSchema } from '../common/sequence/counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    BullModule.registerQueue({
      name: 'patients',
    }),
  ],
  controllers: [PatientsController],
  providers: [PatientsService, SequenceService],
})
export class PatientsModule {}
