import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  EmbeddingsProvider,
  ChatProvider,
  ChatMessage,
  ChatResponse,
  FunctionDefinition,
} from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAIProvider implements EmbeddingsProvider, ChatProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private client: OpenAI;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.client = new OpenAI({ apiKey });
  }

  getName(): string {
    return 'openai';
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async createEmbeddings(texts: string[], model: string = 'text-embedding-3-small'): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    try {
      const response = await this.client.embeddings.create({
        model,
        input: texts,
      });

      return response.data.map((item) => item.embedding);
    } catch (error) {
      throw new Error(
        `Failed to create embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async chat(
    messages: Array<ChatMessage>,
    model: string = 'gpt-4o-mini',
    functions?: FunctionDefinition[],
  ): Promise<ChatResponse> {
    if (messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    try {
      const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = messages.map(
        (msg) => {
          if (msg.function_call) {
            const toolCallId = msg.name || 'call_' + Math.random().toString(36).substring(7);
            return {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: toolCallId,
                  type: 'function',
                  function: {
                    name: msg.function_call.name,
                    arguments: msg.function_call.arguments,
                  },
                },
              ],
            } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;
          }
          if (msg.role === 'function' || msg.role === 'tool') {
            if (!msg.content) {
              throw new Error('Function/Tool messages must have content');
            }
            if (!msg.name) {
              throw new Error('Function/Tool messages must have name (tool_call_id)');
            }
            return {
              role: 'tool',
              tool_call_id: msg.name,
              content: msg.content,
            } as OpenAI.Chat.Completions.ChatCompletionToolMessageParam;
          }
          if (msg.role === 'system') {
            const content = msg.content || '';
            return {
              role: 'system',
              content,
            } as OpenAI.Chat.Completions.ChatCompletionSystemMessageParam;
          }
          if (msg.role === 'user') {
            const content = msg.content || '';
            return {
              role: 'user',
              content,
            } as OpenAI.Chat.Completions.ChatCompletionUserMessageParam;
          }
          if (msg.role === 'assistant') {
            if (msg.content === null) {
              return {
                role: 'assistant',
                content: null,
              } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;
            }
            return {
              role: 'assistant',
              content: msg.content || '',
            } as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam;
          }
          throw new Error(`Unknown message role: ${msg.role}`);
        },
      );

      const requestOptions: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
        model,
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      };

      if (functions && functions.length > 0) {
        requestOptions.tools = functions.map((fn) => ({
          type: 'function',
          function: {
            name: fn.name,
            description: fn.description,
            parameters: fn.parameters,
          },
        }));
        requestOptions.tool_choice = 'required';
        this.logger.debug(`Providing ${functions.length} functions to OpenAI (required): ${functions.map(f => f.name).join(', ')}`);
      } else {
        this.logger.warn('No functions provided to OpenAI');
      }

      const response = await this.client.chat.completions.create(requestOptions);

      const message = response.choices[0]?.message;
      if (!message) {
        throw new Error('Empty response from OpenAI');
      }

      this.logger.debug(`OpenAI response: tool_calls=${message.tool_calls?.length || 0}, has_content=${!!message.content}`);

      if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        if (toolCall.type === 'function') {
          this.logger.log(`OpenAI returned tool_call: ${toolCall.function.name}`);
          return {
            content: null,
            functionCall: {
              name: toolCall.function.name,
              arguments: toolCall.function.arguments,
            },
            toolCallId: toolCall.id,
          };
        }
      } else {
        this.logger.debug(`OpenAI returned content instead of tool_call. Content preview: ${message.content?.substring(0, 100)}`);
      }

      const content = message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      return {
        content,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate chat response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
