import { Testimonial } from '../../domain/entities/testimonial.entity';
import { TestimonialDto } from '../dtos/testimonial.dto';

export class TestimonialMapper {
  static toDto(testimonial: Testimonial): TestimonialDto {
    return {
      id: testimonial.id,
      guestName: testimonial.guestName,
      content: testimonial.content,
      rating: testimonial.rating,
      date: testimonial.date.toISOString(),
    };
  }
}
