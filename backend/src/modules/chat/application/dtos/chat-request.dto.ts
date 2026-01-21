import { IsString, IsOptional, IsArray, IsNumber, Min, Max } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  history?: Array<{ role: string; content: string }>;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  maxContextChunks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  similarityThreshold?: number;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
