export interface Room {
  id: string;
  slug: string;
  name: string;
  description: string;
  capacity: number;
  pricePerNight: number;
  imageUrl: string;
  features: string[];
}
