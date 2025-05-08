import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsISO8601, IsNotEmpty } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ type: Number })
  @IsInt()
  @IsNotEmpty()
  patient_id: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  doctor: string;

  @ApiProperty({ type: String })
  @IsISO8601()
  @IsNotEmpty()
  appointment_date: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
