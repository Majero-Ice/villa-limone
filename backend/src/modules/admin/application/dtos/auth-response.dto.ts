export class AuthResponseDto {
  accessToken: string;
  admin: {
    id: string;
    email: string;
  };
}
