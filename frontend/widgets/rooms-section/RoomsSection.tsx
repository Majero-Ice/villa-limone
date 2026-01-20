import { RoomCard, Room } from '@/entities/room';

const MOCK_ROOMS: Room[] = [
  {
    id: '1',
    slug: 'camera-mare',
    name: 'Camera Mare',
    description: 'Wake up to stunning sea views from your private balcony. This spacious room features a king bed and elegant Mediterranean decor.',
    capacity: 2,
    pricePerNight: 180,
    imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2080',
    features: ['Sea view', 'Balcony', 'King bed', 'AC', 'Mini bar'],
  },
  {
    id: '2',
    slug: 'camera-limone',
    name: 'Camera Limone',
    description: 'Overlooking our lush lemon garden, this charming room offers a peaceful retreat with a private terrace.',
    capacity: 2,
    pricePerNight: 150,
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2080',
    features: ['Garden view', 'Queen bed', 'Terrace', 'AC'],
  },
  {
    id: '3',
    slug: 'suite-portofino',
    name: 'Suite Portofino',
    description: 'Our premier suite with panoramic views, separate living area, and luxurious Jacuzzi. Perfect for families or special occasions.',
    capacity: 4,
    pricePerNight: 280,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2080',
    features: ['Panoramic view', 'Living area', '2BR', 'Jacuzzi'],
  },
  {
    id: '4',
    slug: 'camera-giardino',
    name: 'Camera Giardino',
    description: 'A quiet, intimate room overlooking our peaceful courtyard. Ideal for travelers seeking tranquility.',
    capacity: 2,
    pricePerNight: 130,
    imageUrl: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=2080',
    features: ['Courtyard view', 'Queen bed', 'Quiet', 'Desk'],
  },
];

export function RoomsSection() {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_ROOMS.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>
    </section>
  );
}
