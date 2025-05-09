import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './entities/appointment.entity';
import { BullModule } from '@nestjs/bull';
import { AppointmentsProcessor } from './processors/appointments.processor';
import { PatientsService } from '../patients/patients.service';
import { Patient, PatientSchema } from '../patients/entities/patient.entity';
import { SequenceService } from '../common/sequence/sequence.service';
import { Counter, CounterSchema } from '../common/sequence/counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    BullModule.registerQueue({
      name: 'appointments',
    }),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsProcessor, PatientsService, SequenceService],
})
export class AppointmentsModule {}
