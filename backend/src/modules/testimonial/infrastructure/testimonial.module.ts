import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';
import { TestimonialController } from '../presentation/testimonial.controller';
import { TestimonialPrismaRepository } from './persistence/testimonial.prisma-repository';
import { GetAllTestimonialsUseCase } from '../application/use-cases/get-all-testimonials.use-case';
import { TESTIMONIAL_REPOSITORY } from '../domain/repositories/testimonial.repository.interface';

@Module({
  imports: [PrismaModule],
  controllers: [TestimonialController],
  providers: [
    {
      provide: TESTIMONIAL_REPOSITORY,
      useClass: TestimonialPrismaRepository,
    },
    GetAllTestimonialsUseCase,
  ],
  exports: [TESTIMONIAL_REPOSITORY],
})
export class TestimonialModule {}
