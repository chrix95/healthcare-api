import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret.id;
      delete ret._id;
    },
  },
})
export class Appointment extends Document {
  @ApiProperty({
    description: 'The unique identifier of the appointment',
    example: 1,
  })
  @Prop({ required: true, unique: true, type: Number })
  id: number;

  @ApiProperty({
    description: 'The ID of the patient associated with the appointment',
    example: 101,
  })
  @Prop({ required: true, index: true })
  patient_id: number;

  @ApiProperty({
    description: 'The name of the doctor for the appointment',
    example: 'Dr. Smith',
  })
  @Prop({ required: true, index: true })
  doctor: string;

  @ApiProperty({
    description: 'The date and time of the appointment in ISO 8601 format',
    example: '2024-10-21T10:00:00Z',
  })
  @Prop({ required: true, type: Date })
  appointment_date: Date;

  @ApiProperty({
    description: 'The reason for the appointment',
    example: 'Annual check-up',
  })
  @Prop({ required: true })
  reason: string;

  @ApiProperty({
    description: 'The timestamp when the appointment was created',
    example: '2023-07-20T14:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the appointment was last updated',
    example: '2023-07-20T14:30:00Z',
  })
  updatedAt: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Create index for frequently queried fields
AppointmentSchema.index({ patient_id: 1, doctor: 1 });
AppointmentSchema.index({ appointment_date: 1 });

AppointmentSchema.set('collection', 'appointments');
