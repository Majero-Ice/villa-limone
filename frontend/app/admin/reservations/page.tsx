'use client';

import { useEffect, useState } from 'react';
import { AdminHeader, ReservationsTable } from '@/widgets/admin';
import { Reservation, ReservationListResponse, ReservationStatus, reservationApi } from '@/entities/reservation';
import { Button } from '@/shared/ui';

export default function ReservationsPage() {
  const [data, setData] = useState<ReservationListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | undefined>();
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadReservations = async () => {
      setIsLoading(true);
      try {
        const result = await reservationApi.getAll({
          status: statusFilter,
          page,
          limit: 20,
          orderBy: 'createdAt',
          order: 'desc',
        });
        setData(result);
      } catch (error) {
        console.error('Failed to load reservations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReservations();
  }, [statusFilter, page]);

  const statusOptions: Array<{ value: ReservationStatus | undefined; label: string }> = [
    { value: undefined, label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-serif text-graphite">Reservations</h1>
          </div>

          <div className="mb-6 flex gap-4">
            {statusOptions.map((option) => (
              <Button
                key={option.value || 'all'}
                variant={statusFilter === option.value ? 'primary' : 'outline'}
                onClick={() => {
                  setStatusFilter(option.value);
                  setPage(1);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="card-base p-12 text-center">
              <p className="text-warm-gray">Loading reservations...</p>
            </div>
          ) : data ? (
            <>
              <ReservationsTable reservations={data.reservations} />
              {data.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-warm-gray">
                    Page {data.page} of {data.totalPages} ({data.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                      disabled={page === data.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card-base p-12 text-center">
              <p className="text-warm-gray">Failed to load reservations</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
