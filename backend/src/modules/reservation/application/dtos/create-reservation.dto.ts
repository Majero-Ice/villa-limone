import { IsString, IsEmail, IsDateString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  roomId: string;

  @IsString()
  guestName: string;

  @IsEmail()
  guestEmail: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsInt()
  @Min(1)
  guestsCount: number;

  @IsOptional()
  @IsString()
  specialRequests?: string;

  @IsOptional()
  @IsString()
  conversationId?: string;
}
