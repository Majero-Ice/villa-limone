import { Controller, Get } from '@nestjs/common';
import { GetAllAmenitiesUseCase } from '../application/use-cases/get-all-amenities.use-case';

@Controller('api/amenities')
export class AmenityController {
  constructor(private readonly getAllAmenities: GetAllAmenitiesUseCase) {}

  @Get()
  findAll() {
    return this.getAllAmenities.execute();
  }
}
