import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { GetAllConversationsUseCase } from '../application/use-cases/get-all-conversations.use-case';
import { GetConversationByIdUseCase } from '../application/use-cases/get-conversation-by-id.use-case';
import { ConversationListQueryDto } from '../application/dtos/conversation-list-query.dto';

@Controller('api/admin/conversations')
@UseGuards(JwtAuthGuard)
export class AdminConversationsController {
  constructor(
    private readonly getAllConversations: GetAllConversationsUseCase,
    private readonly getConversationById: GetConversationByIdUseCase,
  ) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: 'createdAt' | 'updatedAt' | 'messageCount',
    @Query('order', new DefaultValuePipe('desc')) order?: 'asc' | 'desc',
  ) {
    const query: ConversationListQueryDto = {
      page,
      limit,
      orderBy,
      order,
    };
    return this.getAllConversations.execute(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getConversationById.execute(id);
  }
}
