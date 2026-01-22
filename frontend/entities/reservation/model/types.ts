export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface ReservationRoom {
  id: string;
  slug: string;
  name: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  room?: ReservationRoom;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalPrice: number;
  status: ReservationStatus;
  specialRequests?: string;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationListQuery {
  status?: ReservationStatus;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'checkIn';
  order?: 'asc' | 'desc';
}

export interface ReservationListResponse {
  reservations: Reservation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  recentReservationsCount: number;
}

export interface UpdateReservationStatusRequest {
  status: ReservationStatus;
}
