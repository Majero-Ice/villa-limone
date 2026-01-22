export interface AdminProps {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class Admin {
  private constructor(private readonly props: AdminProps) {}

  static create(props: AdminProps): Admin {
    if (!props.email || !props.email.includes('@')) {
      throw new Error('Invalid email address');
    }
    if (!props.passwordHash) {
      throw new Error('Password hash is required');
    }
    return new Admin(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
