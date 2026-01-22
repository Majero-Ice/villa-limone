import { Admin } from '../../domain/entities/admin.entity';
import { AdminDto } from '../dtos/admin.dto';

export class AdminMapper {
  static toDto(admin: Admin): AdminDto {
    return {
      id: admin.id,
      email: admin.email,
      createdAt: admin.createdAt,
    };
  }
}
