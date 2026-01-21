import { Room } from '../entities/room.entity';

export interface IRoomRepository {
  findAll(): Promise<Room[]>;
  findBySlug(slug: string): Promise<Room | null>;
}

export const ROOM_REPOSITORY = Symbol('IRoomRepository');
