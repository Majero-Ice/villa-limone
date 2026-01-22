export class ReservationRoomDto {
  id: string;
  slug: string;
  name: string;
}

export class ReservationDto {
  id: string;
  roomId: string;
  room?: ReservationRoomDto;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  totalPrice: number;
  status: string;
  specialRequests?: string;
  conversationId?: string;
  createdAt: Date;
  updatedAt: Date;
}
