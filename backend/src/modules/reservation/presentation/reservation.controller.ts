import { Controller, Post, Body } from '@nestjs/common';
import { CheckAvailabilityUseCase } from '../application/use-cases/check-availability.use-case';
import { CreateReservationUseCase } from '../application/use-cases/create-reservation.use-case';
import { AvailabilityRequestDto } from '../application/dtos/availability-request.dto';
import { CreateReservationDto } from '../application/dtos/create-reservation.dto';

@Controller('api/reservations')
export class ReservationController {
  constructor(
    private readonly checkAvailability: CheckAvailabilityUseCase,
    private readonly createReservation: CreateReservationUseCase,
  ) {}

  @Post('availability')
  check(@Body() dto: AvailabilityRequestDto) {
    return this.checkAvailability.execute(dto);
  }

  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.createReservation.execute(dto);
  }
}
