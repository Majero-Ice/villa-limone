import { Amenity } from '../entities/amenity.entity';

export interface IAmenityRepository {
  findAll(): Promise<Amenity[]>;
}

export const AMENITY_REPOSITORY = Symbol('IAmenityRepository');
