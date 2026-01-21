import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { AiModule } from './shared/infrastructure/ai/ai.module';
import { AppController } from './app.controller';
import { RoomModule } from './modules/room/infrastructure/room.module';
import { AmenityModule } from './modules/amenity/infrastructure/amenity.module';
import { TestimonialModule } from './modules/testimonial/infrastructure/testimonial.module';
import { ChatModule } from './modules/chat/infrastructure/chat.module';
import { ReservationModule } from './modules/reservation/infrastructure/reservation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AiModule,
    RoomModule,
    AmenityModule,
    TestimonialModule,
    ChatModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
