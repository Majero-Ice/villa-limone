import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { IAdminRepository, ADMIN_REPOSITORY } from '../../domain/repositories/admin.repository.interface';
import { AdminDto } from '../dtos/admin.dto';
import { AdminMapper } from '../mappers/admin.mapper';

@Injectable()
export class GetCurrentAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly adminRepository: IAdminRepository,
  ) {}

  async execute(adminId: string): Promise<AdminDto> {
    const admin = await this.adminRepository.findById(adminId);
    
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return AdminMapper.toDto(admin);
  }
}
