import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Patient extends Document {
  @ApiProperty({
    description: 'The unique identifier of the patient',
    example: 1,
  })
  @Prop({ required: true, unique: true, type: Number })
  patientId: number;

  @ApiProperty({
    description: 'The name of the patient',
    example: 'John Doe',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'The age of the patient',
    example: 30,
  })
  @Prop({ required: true })
  age: number;

  @ApiProperty({
    description: 'The gender of the patient',
    example: 'male',
  })
  @Prop({ required: true })
  gender: string;

  @ApiProperty({
    description: 'The contact number of the patient',
    example: '+1234567890',
  })
  @Prop({ required: true })
  contact: string;

  @ApiProperty({
    description: 'The timestamp when the patient was created',
    example: '2025-03-20T14:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The timestamp when the patient was last updated',
    example: '2025-03-20T14:30:00Z',
  })
  updatedAt: Date;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);

PatientSchema.set('collection', 'patients');

// Transform the output
PatientSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret.patientId; // Expose patientId as 'id' in API responses
    delete ret._id;
    delete ret.patientId;
    delete ret.createdAt; // Remove createdAt from the response
    delete ret.updatedAt; // Remove updatedAt from the response
    return ret;
  },
});
