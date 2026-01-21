import { Controller, Get } from '@nestjs/common';
import { GetAllTestimonialsUseCase } from '../application/use-cases/get-all-testimonials.use-case';

@Controller('api/testimonials')
export class TestimonialController {
  constructor(
    private readonly getAllTestimonials: GetAllTestimonialsUseCase,
  ) {}

  @Get()
  findAll() {
    return this.getAllTestimonials.execute();
  }
}
