import { Injectable, Inject } from '@nestjs/common';
import { IAmenityRepository, AMENITY_REPOSITORY } from '../../domain/repositories/amenity.repository.interface';
import { AmenityDto } from '../dtos/amenity.dto';
import { AmenityMapper } from '../mappers/amenity.mapper';

@Injectable()
export class GetAllAmenitiesUseCase {
  constructor(
    @Inject(AMENITY_REPOSITORY)
    private readonly amenityRepository: IAmenityRepository,
  ) {}

  async execute(): Promise<AmenityDto[]> {
    const amenities = await this.amenityRepository.findAll();
    return amenities.map(AmenityMapper.toDto);
  }
}
