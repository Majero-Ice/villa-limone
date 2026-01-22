import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';
import { ReservationModule } from '../../reservation/infrastructure/reservation.module';
import { ChatModule } from '../../chat/infrastructure/chat.module';
import { AdminAuthController } from '../presentation/admin-auth.controller';
import { AdminDashboardController } from '../presentation/admin-dashboard.controller';
import { AdminReservationsController } from '../presentation/admin-reservations.controller';
import { AdminConversationsController } from '../presentation/admin-conversations.controller';
import { AdminSettingsController } from '../presentation/admin-settings.controller';
import { AdminQuickRepliesController } from '../presentation/admin-quick-replies.controller';
import { AdminPrismaRepository } from './persistence/admin.prisma-repository';
import { BotSettingsPrismaRepository } from './persistence/bot-settings.prisma-repository';
import { QuickReplyPrismaRepository } from './persistence/quick-reply.prisma-repository';
import { ADMIN_REPOSITORY } from '../domain/repositories/admin.repository.interface';
import { BOT_SETTINGS_REPOSITORY } from '../domain/repositories/bot-settings.repository.interface';
import { QUICK_REPLY_REPOSITORY } from '../domain/repositories/quick-reply.repository.interface';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { GetCurrentAdminUseCase } from '../application/use-cases/get-current-admin.use-case';
import { GetDashboardStatsUseCase } from '../application/use-cases/get-dashboard-stats.use-case';
import { GetAllReservationsUseCase } from '../application/use-cases/get-all-reservations.use-case';
import { GetReservationByIdUseCase } from '../application/use-cases/get-reservation-by-id.use-case';
import { UpdateReservationStatusUseCase } from '../application/use-cases/update-reservation-status.use-case';
import { DeleteReservationUseCase } from '../application/use-cases/delete-reservation.use-case';
import { GetAllConversationsUseCase } from '../application/use-cases/get-all-conversations.use-case';
import { GetConversationByIdUseCase } from '../application/use-cases/get-conversation-by-id.use-case';
import { GetBotSettingsUseCase } from '../application/use-cases/get-bot-settings.use-case';
import { UpdateBotSettingsUseCase } from '../application/use-cases/update-bot-settings.use-case';
import { GetAllQuickRepliesUseCase } from '../application/use-cases/get-all-quick-replies.use-case';
import { CreateQuickReplyUseCase } from '../application/use-cases/create-quick-reply.use-case';
import { UpdateQuickReplyUseCase } from '../application/use-cases/update-quick-reply.use-case';
import { DeleteQuickReplyUseCase } from '../application/use-cases/delete-quick-reply.use-case';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    ReservationModule,
    ChatModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresInValue = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
          signOptions: {
            expiresIn: expiresInValue as any,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminDashboardController,
    AdminReservationsController,
    AdminConversationsController,
    AdminSettingsController,
    AdminQuickRepliesController,
  ],
  providers: [
    {
      provide: ADMIN_REPOSITORY,
      useClass: AdminPrismaRepository,
    },
    {
      provide: BOT_SETTINGS_REPOSITORY,
      useClass: BotSettingsPrismaRepository,
    },
    {
      provide: QUICK_REPLY_REPOSITORY,
      useClass: QuickReplyPrismaRepository,
    },
    LoginUseCase,
    GetCurrentAdminUseCase,
    GetDashboardStatsUseCase,
    GetAllReservationsUseCase,
    GetReservationByIdUseCase,
    UpdateReservationStatusUseCase,
    DeleteReservationUseCase,
    GetAllConversationsUseCase,
    GetConversationByIdUseCase,
    GetBotSettingsUseCase,
    UpdateBotSettingsUseCase,
    GetAllQuickRepliesUseCase,
    CreateQuickReplyUseCase,
    UpdateQuickReplyUseCase,
    DeleteQuickReplyUseCase,
    JwtStrategy,
  ],
  exports: [ADMIN_REPOSITORY],
})
export class AdminModule {}
