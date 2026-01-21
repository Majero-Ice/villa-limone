import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SendMessageUseCase } from '../application/use-cases/send-message.use-case';
import { ChatRequestDto } from '../application/dtos/chat-request.dto';
import { ChatResponseDto } from '../application/dtos/chat-response.dto';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly sendMessage: SendMessageUseCase) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendChatMessage(@Body() request: ChatRequestDto): Promise<ChatResponseDto> {
    return this.sendMessage.execute(request);
  }
}
