import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';
import { AiModule } from '../../../shared/infrastructure/ai/ai.module';
import { ReservationModule } from '../../reservation/infrastructure/reservation.module';
import { RoomModule } from '../../room/infrastructure/room.module';
import { ChatController } from '../presentation/chat.controller';
import { ProcessChatMessageUseCase } from '../application/use-cases/process-chat-message.use-case';
import { EmbeddingsService } from '../application/services/embeddings.service';
import { SemanticSearchService } from '../application/services/semantic-search.service';
import { RAGService } from '../application/services/rag.service';
import { FunctionDefinitionsService } from '../application/services/function-definitions.service';
import { FunctionHandlerService } from '../application/services/function-handler.service';
import { SystemPromptService } from '../application/services/system-prompt.service';
import { ChunkPrismaRepository } from './persistence/chunk.prisma-repository';
import { ConversationPrismaRepository } from './persistence/conversation.prisma-repository';
import { CHUNK_REPOSITORY } from '../domain/repositories/chunk.repository.interface';
import { CONVERSATION_REPOSITORY } from '../domain/repositories/conversation.repository.interface';
import { BotSettingsPrismaRepository } from '../../admin/infrastructure/persistence/bot-settings.prisma-repository';
import { BOT_SETTINGS_REPOSITORY } from '../../admin/domain/repositories/bot-settings.repository.interface';

@Module({
  imports: [PrismaModule, AiModule, ReservationModule, RoomModule],
  controllers: [ChatController],
  providers: [
    {
      provide: CHUNK_REPOSITORY,
      useClass: ChunkPrismaRepository,
    },
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: ConversationPrismaRepository,
    },
    {
      provide: BOT_SETTINGS_REPOSITORY,
      useClass: BotSettingsPrismaRepository,
    },
    EmbeddingsService,
    SemanticSearchService,
    RAGService,
    FunctionDefinitionsService,
    FunctionHandlerService,
    SystemPromptService,
    ProcessChatMessageUseCase,
  ],
  exports: [CHUNK_REPOSITORY, CONVERSATION_REPOSITORY, EmbeddingsService],
})
export class ChatModule {}
