import {
  Wifi,
  Wind,
  Coffee,
  Car,
  Utensils,
  Waves,
  Sun,
  ShoppingBag,
  LucideIcon,
} from 'lucide-react';
import { Amenity } from '../model/types';

const iconMap: Record<string, LucideIcon> = {
  'wifi': Wifi,
  'ac': Wind,
  'breakfast': Coffee,
  'parking': Car,
  'restaurant': Utensils,
  'beach': Waves,
  'terrace': Sun,
  'concierge': ShoppingBag,
};

interface AmenityCardProps {
  amenity: Amenity;
}

export function AmenityCard({ amenity }: AmenityCardProps) {
  const Icon = iconMap[amenity.icon] || ShoppingBag;

  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-sand transition-colors duration-300">
      <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mb-4">
        <Icon className="text-terracotta" size={32} />
      </div>
      <h4 className="font-serif font-semibold mb-2">{amenity.name}</h4>
      <p className="text-sm text-warm-gray">{amenity.description}</p>
    </div>
  );
}
