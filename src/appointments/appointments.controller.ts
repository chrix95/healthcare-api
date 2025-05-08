import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { PatientsService } from 'src/patients/patients.service';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly patientService: PatientsService,
  ) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, type: AppointmentResponseDto })
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    const patient = await this.patientService.findOne(
      createAppointmentDto.patient_id,
    );
    if (!patient) {
      throw new NotFoundException(
        `Patient with id ${createAppointmentDto.patient_id} not found`,
      );
    }
    return await this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @ApiQuery({ name: 'patient_id', required: false })
  @ApiQuery({ name: 'doctor', required: false })
  @ApiResponse({ status: HttpStatus.OK, type: [AppointmentResponseDto] })
  async findAll(
    @Query('patient_id') patientId?: number,
    @Query('doctor') doctor?: string,
  ) {
    return await this.appointmentsService.findAll(patientId, doctor);
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, type: AppointmentResponseDto })
  async findOne(@Param('id') id: number) {
    const appointment = await this.appointmentsService.findOne(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }
    return appointment;
  }

  // @Post('process-csv')
  // async processCsv(@Body() body: { filepath: string }) {
  //   await this.appointmentsService.processCsv(body.filepath);
  //   return { message: 'CSV processing started' };
  // }
}
