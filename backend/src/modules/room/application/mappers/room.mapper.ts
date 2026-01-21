import { Room } from '../../domain/entities/room.entity';
import { RoomDto } from '../dtos/room.dto';

export class RoomMapper {
  static toDto(room: Room): RoomDto {
    return {
      id: room.id,
      slug: room.slug,
      name: room.name,
      description: room.description,
      capacity: room.capacity,
      pricePerNight: room.pricePerNight.inEuros,
      imageUrl: room.imageUrl,
      features: room.features,
    };
  }
}
