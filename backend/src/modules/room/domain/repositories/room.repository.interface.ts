import { Room } from '../entities/room.entity';

export interface IRoomRepository {
  findAll(): Promise<Room[]>;
  findAllActive(): Promise<Room[]>;
  findBySlug(slug: string): Promise<Room | null>;
  findAvailable(checkIn: Date, checkOut: Date, guests: number): Promise<Room[]>;
}

export const ROOM_REPOSITORY = Symbol('IRoomRepository');
