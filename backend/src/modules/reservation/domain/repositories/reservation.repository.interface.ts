import { Reservation, ReservationStatus } from '../entities/reservation.entity';

export interface FindAllReservationsParams {
  status?: ReservationStatus;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'checkIn';
  order?: 'asc' | 'desc';
}

export interface FindAllReservationsResult {
  reservations: Reservation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IReservationRepository {
  create(reservation: Reservation): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findAll(params?: FindAllReservationsParams): Promise<FindAllReservationsResult>;
  update(reservation: Reservation): Promise<Reservation>;
  delete(id: string): Promise<void>;
  findAvailableRooms(checkIn: Date, checkOut: Date, guests: number): Promise<Array<{ id: string; slug: string; name: string; capacity: number; pricePerNight: number }>>;
}

export const RESERVATION_REPOSITORY = Symbol('IReservationRepository');
