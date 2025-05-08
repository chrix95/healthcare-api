import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: Number })
  @IsInt()
  @IsNotEmpty()
  age: number;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  contact: string;
}
