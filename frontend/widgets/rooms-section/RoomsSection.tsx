'use client';

import { useEffect, useState } from 'react';
import { RoomCard, Room, roomApi } from '@/entities/room';

function RoomCardSkeleton() {
  return (
    <div className="card-elevated p-0 overflow-hidden animate-pulse">
      <div className="w-full h-64 bg-soft-beige" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-soft-beige rounded w-3/4" />
        <div className="h-4 bg-soft-beige rounded w-full" />
        <div className="h-4 bg-soft-beige rounded w-5/6" />
        <div className="flex justify-between items-center pt-4">
          <div className="h-4 bg-soft-beige rounded w-20" />
          <div className="h-6 bg-soft-beige rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export function RoomsSection() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const data = await roomApi.getAll();
        setRooms(data);
      } catch (err) {
        setError('Failed to load rooms. Please try again later.');
        console.error('Error fetching rooms:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <section id="rooms" className="section bg-ivory">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">Our Rooms</h2>
          <p className="text-warm-gray max-w-2xl mx-auto">
            Each room at Villa Limone is uniquely designed to offer comfort and authentic Italian charm.
            Choose the perfect sanctuary for your stay.
          </p>
        </div>

        {error && (
          <div className="text-center py-8">
            <p className="text-danger">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <RoomCardSkeleton key={index} />
              ))
            : rooms.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      </div>
    </section>
  );
}
