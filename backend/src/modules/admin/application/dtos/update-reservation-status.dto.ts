import { IsEnum } from 'class-validator';
import { ReservationStatus } from '../../../reservation/domain/entities/reservation.entity';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
