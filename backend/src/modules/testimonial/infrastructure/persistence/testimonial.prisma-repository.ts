import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { ITestimonialRepository } from '../../domain/repositories/testimonial.repository.interface';
import { Testimonial } from '../../domain/entities/testimonial.entity';
import { TestimonialPrismaMapper } from './testimonial.prisma-mapper';

@Injectable()
export class TestimonialPrismaRepository implements ITestimonialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Testimonial[]> {
    const records = await this.prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { date: 'desc' },
    });
    return records.map(TestimonialPrismaMapper.toDomain);
  }
}
