import { Injectable, Inject } from '@nestjs/common';
import { ITestimonialRepository, TESTIMONIAL_REPOSITORY } from '../../domain/repositories/testimonial.repository.interface';
import { TestimonialDto } from '../dtos/testimonial.dto';
import { TestimonialMapper } from '../mappers/testimonial.mapper';

@Injectable()
export class GetAllTestimonialsUseCase {
  constructor(
    @Inject(TESTIMONIAL_REPOSITORY)
    private readonly testimonialRepository: ITestimonialRepository,
  ) {}

  async execute(): Promise<TestimonialDto[]> {
    const testimonials = await this.testimonialRepository.findAll();
    return testimonials.map(TestimonialMapper.toDto);
  }
}
