import { ReservationDto } from '../../../reservation/application/dtos/reservation.dto';

export class ReservationListResponseDto {
  reservations: ReservationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
