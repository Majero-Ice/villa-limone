import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';
import { AiModule } from '../../../shared/infrastructure/ai/ai.module';
import { ReservationModule } from '../../reservation/infrastructure/reservation.module';
import { ChatController } from '../presentation/chat.controller';
import { SendMessageUseCase } from '../application/use-cases/send-message.use-case';
import { EmbeddingsService } from '../application/services/embeddings.service';
import { SemanticSearchService } from '../application/services/semantic-search.service';
import { FunctionDefinitionsService } from '../application/services/function-definitions.service';
import { FunctionHandlerService } from '../application/services/function-handler.service';
import { ChunkPrismaRepository } from './persistence/chunk.prisma-repository';
import { CHUNK_REPOSITORY } from '../domain/repositories/chunk.repository.interface';

@Module({
  imports: [PrismaModule, AiModule, ReservationModule],
  controllers: [ChatController],
  providers: [
    {
      provide: CHUNK_REPOSITORY,
      useClass: ChunkPrismaRepository,
    },
    EmbeddingsService,
    SemanticSearchService,
    FunctionDefinitionsService,
    FunctionHandlerService,
    SendMessageUseCase,
  ],
  exports: [CHUNK_REPOSITORY, EmbeddingsService],
})
export class ChatModule {}
