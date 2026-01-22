import { DynamicIcon } from 'lucide-react/dynamic';
import { Amenity } from '../model/types';

interface AmenityCardProps {
  amenity: Amenity;
}

export function AmenityCard({ amenity }: AmenityCardProps) {
  const iconName = (amenity.icon || 'shopping-bag') as any;

  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl hover:bg-sand transition-colors duration-300">
      <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mb-4">
        <DynamicIcon 
          name={iconName} 
          className="text-terracotta" 
          size={32}
        />
      </div>
      <h4 className="font-serif font-semibold mb-2">{amenity.name}</h4>
      <p className="text-sm text-warm-gray">{amenity.description}</p>
    </div>
  );
}
