import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { GetAllReservationsUseCase } from '../application/use-cases/get-all-reservations.use-case';
import { GetReservationByIdUseCase } from '../application/use-cases/get-reservation-by-id.use-case';
import { UpdateReservationStatusUseCase } from '../application/use-cases/update-reservation-status.use-case';
import { DeleteReservationUseCase } from '../application/use-cases/delete-reservation.use-case';
import { ReservationListQueryDto } from '../application/dtos/reservation-list-query.dto';
import { UpdateReservationStatusDto } from '../application/dtos/update-reservation-status.dto';

@Controller('api/admin/reservations')
@UseGuards(JwtAuthGuard)
export class AdminReservationsController {
  constructor(
    private readonly getAllReservations: GetAllReservationsUseCase,
    private readonly getReservationById: GetReservationByIdUseCase,
    private readonly updateReservationStatus: UpdateReservationStatusUseCase,
    private readonly deleteReservation: DeleteReservationUseCase,
  ) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: 'createdAt' | 'checkIn',
    @Query('order', new DefaultValuePipe('desc')) order?: 'asc' | 'desc',
  ) {
    const query: ReservationListQueryDto = {
      status: status as any,
      page,
      limit,
      orderBy,
      order,
    };
    return this.getAllReservations.execute(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getReservationById.execute(id);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReservationStatusDto) {
    return this.updateReservationStatus.execute(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteReservation.execute(id);
  }
}
