import { Injectable, Inject } from '@nestjs/common';
import { IRoomRepository, ROOM_REPOSITORY } from '../../domain/repositories/room.repository.interface';
import { RoomDto } from '../dtos/room.dto';
import { RoomMapper } from '../mappers/room.mapper';

@Injectable()
export class GetAllRoomsUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(): Promise<RoomDto[]> {
    const rooms = await this.roomRepository.findAll();
    return rooms.map(RoomMapper.toDto);
  }
}
