import { ApiProperty } from '@nestjs/swagger';

export class AppointmentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  patient_id: number;

  @ApiProperty()
  doctor: string;

  @ApiProperty()
  appointment_date: string;

  @ApiProperty()
  reason: string;
}
