import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { GetCurrentAdminUseCase } from '../application/use-cases/get-current-admin.use-case';
import { LoginDto } from '../application/dtos/login.dto';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('api/admin/auth')
export class AdminAuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentAdminUseCase: GetCurrentAdminUseCase,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: AuthenticatedRequest) {
    return this.getCurrentAdminUseCase.execute(req.user.id);
  }
}
