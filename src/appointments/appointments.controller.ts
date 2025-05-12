import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpStatus,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../config/multer.config';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
  ) {}

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

  @Post('')
  @UseInterceptors(FileInterceptor('filepath', multerOptions))
  async processAppointments(@UploadedFile() filepath: Express.Multer.File) {
    try {
      if (!filepath) {
        throw new Error('No file uploaded');
      }
      
      const result = await this.appointmentsService.processAppointmentsFile(filepath);
      return { 
        message: 'Appointments processing started',
        details: result
      };
    } catch (error) {
      throw new Error(error.message || 'File processing failed');
    }
  }
}
