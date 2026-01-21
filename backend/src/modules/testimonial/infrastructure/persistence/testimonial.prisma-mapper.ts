import { Testimonial as PrismaTestimonial } from '@prisma/client';
import { Testimonial } from '../../domain/entities/testimonial.entity';

export class TestimonialPrismaMapper {
  static toDomain(record: PrismaTestimonial): Testimonial {
    return Testimonial.create({
      id: record.id,
      guestName: record.guestName,
      content: record.content,
      rating: record.rating,
      date: record.date,
      isActive: record.isActive,
    });
  }
}
