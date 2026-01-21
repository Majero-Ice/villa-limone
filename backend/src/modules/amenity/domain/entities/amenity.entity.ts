export interface AmenityProps {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export class Amenity {
  private constructor(private readonly props: AmenityProps) {}

  static create(props: AmenityProps): Amenity {
    return new Amenity(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get icon(): string {
    return this.props.icon;
  }

  get category(): string {
    return this.props.category;
  }

  get sortOrder(): number {
    return this.props.sortOrder;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}
