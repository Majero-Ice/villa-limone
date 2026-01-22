import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { GetBotSettingsUseCase } from '../application/use-cases/get-bot-settings.use-case';
import { UpdateBotSettingsUseCase } from '../application/use-cases/update-bot-settings.use-case';
import { UpdateBotSettingsDto } from '../application/dtos/bot-settings.dto';

@Controller('api/admin/settings')
@UseGuards(JwtAuthGuard)
export class AdminSettingsController {
  constructor(
    private readonly getBotSettings: GetBotSettingsUseCase,
    private readonly updateBotSettings: UpdateBotSettingsUseCase,
  ) {}

  @Get()
  getSettings() {
    return this.getBotSettings.execute();
  }

  @Patch()
  updateSettings(@Body() dto: UpdateBotSettingsDto) {
    return this.updateBotSettings.execute(dto);
  }
}
