import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { GetAllQuickRepliesUseCase } from '../application/use-cases/get-all-quick-replies.use-case';
import { CreateQuickReplyUseCase } from '../application/use-cases/create-quick-reply.use-case';
import { UpdateQuickReplyUseCase } from '../application/use-cases/update-quick-reply.use-case';
import { DeleteQuickReplyUseCase } from '../application/use-cases/delete-quick-reply.use-case';
import { CreateQuickReplyDto } from '../application/dtos/quick-reply.dto';
import { UpdateQuickReplyDto } from '../application/dtos/quick-reply.dto';

@Controller('api/admin/quick-replies')
@UseGuards(JwtAuthGuard)
export class AdminQuickRepliesController {
  constructor(
    private readonly getAllQuickReplies: GetAllQuickRepliesUseCase,
    private readonly createQuickReply: CreateQuickReplyUseCase,
    private readonly updateQuickReply: UpdateQuickReplyUseCase,
    private readonly deleteQuickReply: DeleteQuickReplyUseCase,
  ) {}

  @Get()
  findAll() {
    return this.getAllQuickReplies.execute();
  }

  @Post()
  create(@Body() dto: CreateQuickReplyDto) {
    return this.createQuickReply.execute(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuickReplyDto) {
    return this.updateQuickReply.execute(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteQuickReply.execute(id);
  }
}
