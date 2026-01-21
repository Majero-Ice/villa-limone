import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';
import { RoomController } from '../presentation/room.controller';
import { RoomPrismaRepository } from './persistence/room.prisma-repository';
import { GetAllRoomsUseCase } from '../application/use-cases/get-all-rooms.use-case';
import { ROOM_REPOSITORY } from '../domain/repositories/room.repository.interface';
import { ReservationModule } from '../../reservation/infrastructure/reservation.module';

@Module({
  imports: [PrismaModule, ReservationModule],
  controllers: [RoomController],
  providers: [
    {
      provide: ROOM_REPOSITORY,
      useClass: RoomPrismaRepository,
    },
    GetAllRoomsUseCase,
  ],
  exports: [ROOM_REPOSITORY],
})
export class RoomModule {}
