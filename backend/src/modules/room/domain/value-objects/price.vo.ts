export class Price {
  private constructor(private readonly cents: number) {}

  static fromCents(cents: number): Price {
    if (cents < 0) {
      throw new Error('Price cannot be negative');
    }
    return new Price(cents);
  }

  get inCents(): number {
    return this.cents;
  }

  get inEuros(): number {
    return this.cents / 100;
  }

  multiply(nights: number): Price {
    return Price.fromCents(this.cents * nights);
  }
}
