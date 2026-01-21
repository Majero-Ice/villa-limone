import { Price } from '../../../room/domain/value-objects/price.vo';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface ReservationProps {
  id: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
  totalPrice: Price;
  status: ReservationStatus;
  specialRequests?: string;
  conversationId?: string;
}

export class Reservation {
  private constructor(private readonly props: ReservationProps) {}

  static create(props: ReservationProps): Reservation {
    if (props.checkIn >= props.checkOut) {
      throw new Error('Check-in date must be before check-out date');
    }
    if (props.guestsCount < 1) {
      throw new Error('Guest count must be at least 1');
    }
    if (!props.guestEmail || !props.guestEmail.includes('@')) {
      throw new Error('Valid email is required');
    }
    return new Reservation(props);
  }

  get id(): string {
    return this.props.id;
  }

  get roomId(): string {
    return this.props.roomId;
  }

  get guestName(): string {
    return this.props.guestName;
  }

  get guestEmail(): string {
    return this.props.guestEmail;
  }

  get checkIn(): Date {
    return this.props.checkIn;
  }

  get checkOut(): Date {
    return this.props.checkOut;
  }

  get guestsCount(): number {
    return this.props.guestsCount;
  }

  get totalPrice(): Price {
    return this.props.totalPrice;
  }

  get status(): ReservationStatus {
    return this.props.status;
  }

  get specialRequests(): string | undefined {
    return this.props.specialRequests;
  }

  get conversationId(): string | undefined {
    return this.props.conversationId;
  }

  confirm(): void {
    if (this.props.status !== ReservationStatus.PENDING) {
      throw new Error('Only pending reservations can be confirmed');
    }
    (this.props as any).status = ReservationStatus.CONFIRMED;
  }

  cancel(): void {
    if (this.props.status === ReservationStatus.CANCELLED) {
      throw new Error('Reservation is already cancelled');
    }
    (this.props as any).status = ReservationStatus.CANCELLED;
  }
}
