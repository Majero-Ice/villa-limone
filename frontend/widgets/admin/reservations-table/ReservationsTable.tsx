'use client';

import Link from 'next/link';
import { Reservation, ReservationStatus } from '@/entities/reservation';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatDateTime } from '@/shared/lib/formatDate';
import { formatPrice } from '@/shared/lib/formatPrice';

interface ReservationsTableProps {
  reservations: Reservation[];
}

export function ReservationsTable({ reservations }: ReservationsTableProps) {
  if (reservations.length === 0) {
    return (
      <div className="card-base p-12 text-center">
        <p className="text-warm-gray">No reservations found</p>
      </div>
    );
  }

  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-soft-beige">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Guest</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Room</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Check-in</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Check-out</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Guests</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Total</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-graphite">Created</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-graphite">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soft-beige">
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="hover:bg-sand/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-graphite">{reservation.guestName}</div>
                    <div className="text-sm text-warm-gray">{reservation.guestEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-graphite">
                  {reservation.room?.name || 'Unknown Room'}
                </td>
                <td className="px-6 py-4 text-graphite">{formatDate(reservation.checkIn)}</td>
                <td className="px-6 py-4 text-graphite">{formatDate(reservation.checkOut)}</td>
                <td className="px-6 py-4 text-graphite">{reservation.guestsCount}</td>
                <td className="px-6 py-4 font-medium text-graphite">
                  {formatPrice(reservation.totalPrice)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={reservation.status} />
                </td>
                <td className="px-6 py-4 text-sm text-warm-gray">
                  {formatDateTime(reservation.createdAt)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/reservations/${reservation.id}`}
                    className="text-terracotta hover:text-terracotta-dark font-medium text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
