import { Price } from '../value-objects/price.vo';

export interface RoomProps {
  id: string;
  slug: string;
  name: string;
  description: string;
  capacity: number;
  pricePerNight: Price;
  imageUrl: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export class Room {
  private constructor(private readonly props: RoomProps) {}

  static create(props: RoomProps): Room {
    if (props.capacity < 1) {
      throw new Error('Room capacity must be at least 1');
    }
    return new Room(props);
  }

  get id(): string {
    return this.props.id;
  }

  get slug(): string {
    return this.props.slug;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get pricePerNight(): Price {
    return this.props.pricePerNight;
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  get features(): string[] {
    return this.props.features;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get sortOrder(): number {
    return this.props.sortOrder;
  }

  canAccommodate(guests: number): boolean {
    return guests <= this.props.capacity;
  }
}
