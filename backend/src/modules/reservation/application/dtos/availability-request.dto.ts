import { IsDateString, IsInt, Min } from 'class-validator';

export class AvailabilityRequestDto {
  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsInt()
  @Min(1)
  guests: number;
}
