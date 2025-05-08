import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './entities/appointment.entity';
import { BullModule } from '@nestjs/bull';
import { AppointmentsProcessor } from './processors/appointments.processor';
import { PatientsService } from '../patients/patients.service';
import { Patient, PatientSchema } from '../patients/entities/patient.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
    BullModule.registerQueue({
      name: 'appointments',
    }),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsProcessor, PatientsService],
})
export class AppointmentsModule {}
