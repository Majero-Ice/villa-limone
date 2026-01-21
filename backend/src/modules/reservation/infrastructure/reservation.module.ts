import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';
import { RESERVATION_REPOSITORY } from '../domain/repositories/reservation.repository.interface';
import { ReservationPrismaRepository } from './persistence/reservation.prisma-repository';
import { CheckAvailabilityUseCase } from '../application/use-cases/check-availability.use-case';
import { CreateReservationUseCase } from '../application/use-cases/create-reservation.use-case';
import { ReservationController } from '../presentation/reservation.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ReservationController],
  providers: [
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationPrismaRepository,
    },
    CheckAvailabilityUseCase,
    CreateReservationUseCase,
  ],
  exports: [RESERVATION_REPOSITORY, CheckAvailabilityUseCase, CreateReservationUseCase],
})
export class ReservationModule {}
