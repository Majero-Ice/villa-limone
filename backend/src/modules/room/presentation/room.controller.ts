import { Controller, Get, Post, Body } from '@nestjs/common';
import { GetAllRoomsUseCase } from '../application/use-cases/get-all-rooms.use-case';
import { CheckAvailabilityUseCase } from '../../reservation/application/use-cases/check-availability.use-case';
import { AvailabilityRequestDto } from '../../reservation/application/dtos/availability-request.dto';

@Controller('api/rooms')
export class RoomController {
  constructor(
    private readonly getAllRooms: GetAllRoomsUseCase,
    private readonly checkAvailability: CheckAvailabilityUseCase,
  ) {}

  @Get()
  findAll() {
    return this.getAllRooms.execute();
  }

  @Post('availability')
  check(@Body() dto: AvailabilityRequestDto) {
    return this.checkAvailability.execute(dto);
  }
}
