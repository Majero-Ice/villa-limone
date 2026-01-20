import { Room } from '../model/types';
import { Users } from 'lucide-react';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="card-elevated overflow-hidden group cursor-pointer">
      <div className="relative h-64 overflow-hidden">
        <img
          src={room.imageUrl}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-h4 mb-2">{room.name}</h3>
        <p className="text-warm-gray mb-4 line-clamp-2">{room.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-warm-gray text-sm">
            <Users size={16} />
            <span>Up to {room.capacity} guests</span>
          </div>
          <div className="text-terracotta font-semibold text-lg">
            €{room.pricePerNight}<span className="text-sm font-normal">/night</span>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {room.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="text-xs px-2 py-1 bg-olive/10 text-olive-dark rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
