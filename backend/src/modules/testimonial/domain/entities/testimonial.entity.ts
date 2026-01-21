export interface TestimonialProps {
  id: string;
  guestName: string;
  content: string;
  rating: number;
  date: Date;
  isActive: boolean;
}

export class Testimonial {
  private constructor(private readonly props: TestimonialProps) {}

  static create(props: TestimonialProps): Testimonial {
    if (props.rating < 1 || props.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return new Testimonial(props);
  }

  get id(): string {
    return this.props.id;
  }

  get guestName(): string {
    return this.props.guestName;
  }

  get content(): string {
    return this.props.content;
  }

  get rating(): number {
    return this.props.rating;
  }

  get date(): Date {
    return this.props.date;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}
