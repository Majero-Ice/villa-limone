import { ReservationStatus } from '../../../reservation/domain/entities/reservation.entity';

export class ReservationListQueryDto {
  status?: ReservationStatus;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'checkIn';
  order?: 'asc' | 'desc';
}
