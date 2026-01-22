'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminHeader, StatusBadge } from '@/widgets/admin';
import { Reservation, ReservationStatus, reservationApi } from '@/entities/reservation';
import { Button } from '@/shared/ui';
import { formatDate, formatDateTime } from '@/shared/lib/formatDate';
import { formatPrice } from '@/shared/lib/formatPrice';

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadReservation = async () => {
      try {
        const data = await reservationApi.getById(id);
        setReservation(data);
      } catch (error) {
        console.error('Failed to load reservation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadReservation();
    }
  }, [id]);

  const handleStatusUpdate = async (status: ReservationStatus) => {
    if (!reservation) return;

    setIsUpdating(true);
    try {
      const updated = await reservationApi.updateStatus(id, { status });
      setReservation(updated);
    } catch (error: any) {
      console.error('Failed to update reservation status:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update reservation status';
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!reservation) return;
    if (!confirm('Are you sure you want to delete this reservation? This action cannot be undone.')) {
      return;
    }

    setIsUpdating(true);
    try {
      await reservationApi.delete(id);
      router.push('/admin/reservations');
    } catch (error) {
      console.error('Failed to delete reservation:', error);
      alert('Failed to delete reservation');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="card-base p-12 text-center">
              <p className="text-warm-gray">Loading reservation...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!reservation) {
    return (
      <>
        <AdminHeader />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="card-base p-12 text-center">
              <p className="text-warm-gray">Reservation not found</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/reservations')}>
                Back to Reservations
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" onClick={() => router.push('/admin/reservations')}>
              ← Back to Reservations
            </Button>
          </div>

          <div className="card-base p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-serif text-graphite">Reservation Details</h1>
              <StatusBadge status={reservation.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-warm-gray mb-2">Guest Information</h3>
                <p className="text-graphite font-medium">{reservation.guestName}</p>
                <p className="text-warm-gray">{reservation.guestEmail}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-warm-gray mb-2">Room</h3>
                <p className="text-graphite font-medium">{reservation.room?.name || 'Unknown Room'}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-warm-gray mb-2">Check-in</h3>
                <p className="text-graphite">{formatDate(reservation.checkIn)}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-warm-gray mb-2">Check-out</h3>
                <p className="text-graphite">{formatDate(reservation.checkOut)}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-warm-gray mb-2">Guests</h3>
                <p className="text-graphite">{reservation.guestsCount}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-warm-gray mb-2">Total Price</h3>
                <p className="text-graphite font-semibold text-lg">{formatPrice(reservation.totalPrice)}</p>
              </div>

              {reservation.specialRequests && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-warm-gray mb-2">Special Requests</h3>
                  <p className="text-graphite">{reservation.specialRequests}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-warm-gray mb-2">Created</h3>
                <p className="text-graphite text-sm">{formatDateTime(reservation.createdAt)}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-warm-gray mb-2">Last Updated</h3>
                <p className="text-graphite text-sm">{formatDateTime(reservation.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="card-base p-6">
            <h2 className="text-xl font-serif text-graphite mb-4">Actions</h2>
            <div className="flex flex-wrap gap-4">
              {reservation.status === 'PENDING' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleStatusUpdate('CONFIRMED')}
                    disabled={isUpdating}
                  >
                    Confirm Reservation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleStatusUpdate('CANCELLED')}
                    disabled={isUpdating}
                  >
                    Cancel Reservation
                  </Button>
                </>
              )}
              {reservation.status === 'CONFIRMED' && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('CANCELLED')}
                  disabled={isUpdating}
                >
                  Cancel Reservation
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isUpdating}
                className="text-danger border-danger hover:bg-danger hover:text-ivory"
              >
                Delete Reservation
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
