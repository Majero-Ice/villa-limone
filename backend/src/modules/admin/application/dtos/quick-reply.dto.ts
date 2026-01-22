import { IsString, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

export class QuickReplyDto {
  id: string;
  trigger: string;
  response: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

export class CreateQuickReplyDto {
  @IsString()
  trigger: string;

  @IsString()
  response: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateQuickReplyDto {
  @IsOptional()
  @IsString()
  trigger?: string;

  @IsOptional()
  @IsString()
  response?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
