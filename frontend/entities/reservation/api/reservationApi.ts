import { api } from '@/shared/lib/api';
import {
  Reservation,
  ReservationListQuery,
  ReservationListResponse,
  DashboardStats,
  UpdateReservationStatusRequest,
} from '../model/types';

export const reservationApi = {
  getAll: async (query?: ReservationListQuery): Promise<ReservationListResponse> => {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.orderBy) params.append('orderBy', query.orderBy);
    if (query?.order) params.append('order', query.order);

    const response = await api.get<ReservationListResponse>(
      `/api/admin/reservations?${params.toString()}`,
    );
    return response.data;
  },

  getById: async (id: string): Promise<Reservation> => {
    const response = await api.get<Reservation>(`/api/admin/reservations/${id}`);
    return response.data;
  },

  updateStatus: async (
    id: string,
    data: UpdateReservationStatusRequest,
  ): Promise<Reservation> => {
    const response = await api.patch<Reservation>(
      `/api/admin/reservations/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/reservations/${id}`);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/api/admin/dashboard/stats');
    return response.data;
  },
};
