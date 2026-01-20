import { AmenityCard, Amenity } from '@/entities/amenity';

const MOCK_AMENITIES: Amenity[] = [
  { id: '1', name: 'Free WiFi', description: 'High-speed internet throughout the property', icon: 'wifi', category: 'general' },
  { id: '2', name: 'Air Conditioning', description: 'Climate control in all rooms', icon: 'ac', category: 'general' },
  { id: '3', name: 'Breakfast Included', description: 'Homemade Italian breakfast daily', icon: 'breakfast', category: 'dining' },
  { id: '4', name: 'Free Parking', description: 'On-site parking available', icon: 'parking', category: 'services' },
  { id: '5', name: 'Restaurant', description: 'Traditional Ligurian cuisine', icon: 'restaurant', category: 'dining' },
  { id: '6', name: 'Beach Access', description: 'Private beach 2 minutes walk', icon: 'beach', category: 'wellness' },
  { id: '7', name: 'Garden Terrace', description: 'Relax among lemon trees', icon: 'terrace', category: 'wellness' },
  { id: '8', name: 'Concierge', description: 'Local recommendations and bookings', icon: 'concierge', category: 'services' },
];

export function AmenitiesSection() {
  return (
    <section id="amenities" className="section bg-sand">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-h2 mb-4">Amenities</h2>
          <p className="text-warm-gray max-w-2xl mx-auto">
            Everything you need for a comfortable and memorable stay on the Ligurian coast.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_AMENITIES.map((amenity) => (
            <AmenityCard key={amenity.id} amenity={amenity} />
          ))}
        </div>
      </div>
    </section>
  );
}
