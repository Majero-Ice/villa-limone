import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AI_PROVIDER } from './ai.constants';
import { OpenAIProvider } from './providers/openai.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AI_PROVIDER,
      useClass: OpenAIProvider,
    },
  ],
  exports: [AI_PROVIDER],
})
export class AiModule {}
