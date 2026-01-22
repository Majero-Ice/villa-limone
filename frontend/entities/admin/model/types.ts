export interface Admin {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  admin: {
    id: string;
    email: string;
  };
}
