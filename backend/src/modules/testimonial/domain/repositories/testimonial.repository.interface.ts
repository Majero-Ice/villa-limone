import { Testimonial } from '../entities/testimonial.entity';

export interface ITestimonialRepository {
  findAll(): Promise<Testimonial[]>;
}

export const TESTIMONIAL_REPOSITORY = Symbol('ITestimonialRepository');
