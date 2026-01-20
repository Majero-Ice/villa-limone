import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): { message: string; status: string } {
    return {
      message: 'Villa Limone API',
      status: 'ok',
    };
  }

  @Get('health')
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
