import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';
import { AmenityController } from '../presentation/amenity.controller';
import { AmenityPrismaRepository } from './persistence/amenity.prisma-repository';
import { GetAllAmenitiesUseCase } from '../application/use-cases/get-all-amenities.use-case';
import { AMENITY_REPOSITORY } from '../domain/repositories/amenity.repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [AmenityController],
  providers: [
    {
      provide: AMENITY_REPOSITORY,
      useClass: AmenityPrismaRepository,
    },
    GetAllAmenitiesUseCase,
  ],
  exports: [AMENITY_REPOSITORY],
})
export class AmenityModule {}
