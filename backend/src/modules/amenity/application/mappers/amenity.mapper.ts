import { Amenity } from '../../domain/entities/amenity.entity';
import { AmenityDto } from '../dtos/amenity.dto';

export class AmenityMapper {
  static toDto(amenity: Amenity): AmenityDto {
    return {
      id: amenity.id,
      name: amenity.name,
      description: amenity.description,
      icon: amenity.icon,
      category: amenity.category,
    };
  }
}
