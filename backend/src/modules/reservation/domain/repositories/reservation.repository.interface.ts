import { Reservation } from '../entities/reservation.entity';

export interface IReservationRepository {
  create(reservation: Reservation): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findAvailableRooms(checkIn: Date, checkOut: Date, guests: number): Promise<Array<{ id: string; slug: string; name: string; capacity: number; pricePerNight: number }>>;
}

export const RESERVATION_REPOSITORY = Symbol('IReservationRepository');
