import { Admin } from '../entities/admin.entity';

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
}

export const ADMIN_REPOSITORY = Symbol('IAdminRepository');
