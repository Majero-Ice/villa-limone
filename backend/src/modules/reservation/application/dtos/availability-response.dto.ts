export class AvailabilityResponseDto {
  availableRooms: Array<{
    id: string;
    slug: string;
    name: string;
    capacity: number;
    pricePerNight: number;
    totalPrice: number;
    nights: number;
  }>;
}
