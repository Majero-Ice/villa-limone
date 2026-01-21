export class ReservationDto {
  id: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  totalPrice: number;
  status: string;
  specialRequests?: string;
  conversationId?: string;
}
