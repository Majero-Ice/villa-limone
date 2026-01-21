'use client';

import { useEffect, useState } from 'react';
import { AmenityCard, Amenity, amenityApi } from '@/entities/amenity';

function AmenityCardSkeleton() {
  return (
    <div className="card-base p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-soft-beige rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-soft-beige rounded w-3/4" />
          <div className="h-4 bg-soft-beige rounded w-full" />
        </div>
      </div>
    </div>
  );
}

export function AmenitiesSection() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setIsLoading(true);
        const data = await amenityApi.getAll();
        setAmenities(data);
      } catch (err) {
        setError('Failed to load amenities. Please try again later.');
        console.error('Error fetching amenities:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  return (
    <section id="amenities" className="section bg-sand">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">Amenities</h2>
          <p className="text-warm-gray max-w-2xl mx-auto">
            Everything you need for a comfortable and memorable stay on the Ligurian coast.
          </p>
        </div>

        {error && (
          <div className="text-center py-8">
            <p className="text-danger">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <AmenityCardSkeleton key={index} />
              ))
            : amenities.map((amenity) => (
                <AmenityCard key={amenity.id} amenity={amenity} />
              ))}
        </div>
      </div>
    </section>
  );
}
