import { Injectable, Inject, BadRequestException, Logger } from '@nestjs/common';
import { AI_PROVIDER } from '../../../../shared/infrastructure/ai/ai.constants';
import { ChatProvider, ChatMessage } from '../../../../shared/infrastructure/ai/interfaces/ai-provider.interface';
import { SemanticSearchService } from '../services/semantic-search.service';
import { FunctionDefinitionsService } from '../services/function-definitions.service';
import { FunctionHandlerService } from '../services/function-handler.service';
import { ChatRequestDto } from '../dtos/chat-request.dto';
import { ChatResponseDto } from '../dtos/chat-response.dto';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

interface ChatOptions {
  maxContextChunks: number;
  similarityThreshold: number;
  model: string;
}

interface BookingState {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  roomId?: string;
  guestName?: string;
  guestEmail?: string;
  specialRequests?: string;
  availableRooms?: Array<{
    id: string;
    name: string;
    slug: string;
    capacity: number;
    pricePerNight: number;
    totalPrice: number;
    nights: number;
  }>;
}

@Injectable()
export class SendMessageUseCase {
  private readonly logger = new Logger(SendMessageUseCase.name);

  constructor(
    private readonly semanticSearchService: SemanticSearchService,
    @Inject(AI_PROVIDER)
    private readonly aiProvider: ChatProvider,
    private readonly prisma: PrismaService,
    private readonly functionDefinitions: FunctionDefinitionsService,
    private readonly functionHandler: FunctionHandlerService,
  ) {}

  async execute(request: ChatRequestDto): Promise<ChatResponseDto> {
    if (!request.message || request.message.trim().length === 0) {
      throw new BadRequestException('Message cannot be empty');
    }

    const options: ChatOptions = {
      maxContextChunks: request.maxContextChunks ?? 5,
      similarityThreshold: request.similarityThreshold ?? 0.3,
      model: 'gpt-4o-mini',
    };

    const relevantChunks = await this.findRelevantContext(request.message, options);
    const context = this.buildContext(relevantChunks);

    let conversation = null;
    if (request.sessionId) {
      conversation = await this.getOrCreateConversation(request.sessionId);
    }

    const bookingState = this.getBookingState(conversation);
    const systemPrompt = await this.getSystemPrompt(bookingState);
    const userPrompt = this.buildUserPrompt(request.message, context, bookingState);

    const messages = this.buildMessages(systemPrompt, userPrompt, request.history, conversation);
    const functions = this.functionDefinitions.getFunctionDefinitions();

    this.logger.log(`Functions available: ${functions.map(f => f.name).join(', ')}`);
    this.logger.debug(`System prompt length: ${systemPrompt.length} chars`);
    this.logger.debug(`Messages count: ${messages.length}`);

    let finalResponse: string = '';
    let functionCallResult: any = null;
    let lastFunctionCall: any = null;
    let lastToolCallId: string | undefined = undefined;
    const maxIterations = 5;
    let iteration = 0;

    this.logger.log(`Starting chat processing. Max iterations: ${maxIterations}`);

    while (iteration < maxIterations) {
      this.logger.debug(`Iteration ${iteration + 1}/${maxIterations}`);
      
      const response = await this.aiProvider.chat(messages, options.model, functions);

      if (response.functionCall) {
        this.logger.log(`Function call detected: ${response.functionCall.name}`, JSON.stringify(response.functionCall, null, 2));
        lastFunctionCall = response.functionCall;
        lastToolCallId = response.toolCallId;
        const currentToolCallId = response.toolCallId;
        
        const functionResult = await this.functionHandler.handleFunctionCall(
          response.functionCall,
          conversation?.id,
        );

        this.logger.log(`Function result for ${response.functionCall.name}:`, JSON.stringify({
          success: functionResult.result.success !== false,
          hasError: !!functionResult.result.error,
          result: functionResult.result,
        }, null, 2));

        if (response.functionCall.name === 'check_availability') {
          const args = JSON.parse(response.functionCall.arguments);
          await this.updateBookingState(conversation, {
            checkIn: args.checkIn,
            checkOut: args.checkOut,
            guests: args.guests,
            availableRooms: functionResult.result.availableRooms || [],
          });
          this.logger.log(`Updated booking state with ${functionResult.result.availableRooms?.length || 0} available rooms`);
        }

        if (response.functionCall.name === 'create_reservation') {
          const args = JSON.parse(response.functionCall.arguments);
          this.logger.log(`Creating reservation with args:`, JSON.stringify(args, null, 2));
          
          await this.updateBookingState(conversation, {
            roomId: args.roomId,
            guestName: args.guestName,
            guestEmail: args.guestEmail,
            checkIn: args.checkIn,
            checkOut: args.checkOut,
            guests: args.guestsCount,
            specialRequests: args.specialRequests,
          });
        }

        if (response.functionCall.name === 'answer_question') {
          if (functionResult.result.success && functionResult.result.response) {
            this.logger.log(`Received answer from answer_question function (${functionResult.result.response.length} chars)`);
            finalResponse = functionResult.result.response;
            functionCallResult = functionResult.result;
            if (conversation) {
              await this.saveConversation(conversation.id, request.message, finalResponse, functionCallResult, lastFunctionCall, currentToolCallId);
            }
            break;
          }
        }

        messages.push({
          role: 'assistant',
          content: null,
          function_call: response.functionCall,
          name: currentToolCallId,
        });

        const functionResponseContent = JSON.stringify(functionResult.result);
        this.logger.debug(`Sending function result to AI with toolCallId: ${currentToolCallId}`);

        messages.push({
          role: 'function',
          name: currentToolCallId || response.functionCall.name,
          content: functionResponseContent,
        });

        functionCallResult = functionResult.result;
        
        if (!functionResult.shouldContinue) {
          this.logger.log(`Function ${response.functionCall.name} indicated conversation should end`);
          if (conversation) {
            await this.saveConversation(conversation.id, request.message, finalResponse || 'Function call completed', functionCallResult, lastFunctionCall, currentToolCallId);
          }
          break;
        }
        
        iteration++;
        continue;
      }

      if (response.content) {
        this.logger.log(`Received final response from AI (${response.content.length} chars)`);
        finalResponse = response.content;
        break;
      }

      iteration++;
    }

    if (!finalResponse) {
      this.logger.warn(`No final response after ${maxIterations} iterations`);
      finalResponse = 'I apologize, but I encountered an issue processing your request. Please try again.';
    }

    if (lastFunctionCall) {
      this.logger.log(`Last function call was: ${lastFunctionCall.name}`);
    } else {
      this.logger.warn('No function calls were made during this conversation turn - this should not happen with tool_choice=required');
    }

    if (conversation) {
      await this.saveConversation(conversation.id, request.message, finalResponse, functionCallResult, lastFunctionCall, lastToolCallId);
    }

    return {
      message: finalResponse,
      sources: relevantChunks.map((item) => ({
        chunkId: item.chunk.id,
        content: item.chunk.content,
        similarity: item.similarity,
      })),
      model: options.model,
      functionCall: functionCallResult ? { name: 'executed', arguments: JSON.stringify(functionCallResult) } : undefined,
    };
  }

  private async getOrCreateConversation(sessionId: string) {
    let conversation = await this.prisma.conversation.findFirst({
      where: { sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          sessionId,
          messageCount: 0,
        },
        include: { messages: true },
      });
    }

    return conversation;
  }

  private getBookingState(conversation: any): BookingState {
    if (!conversation) {
      return {};
    }

    if (conversation.metadata && typeof conversation.metadata === 'object') {
      const metadata = conversation.metadata as any;
      if (metadata.bookingState) {
        return { ...metadata.bookingState };
      }
    }

    return {};
  }

  private async updateBookingState(conversation: any, updates: Partial<BookingState>) {
    if (!conversation) return;

    const currentState = this.getBookingState(conversation);
    const newState = { ...currentState, ...updates };

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        metadata: { bookingState: newState },
      },
    });
    
    this.logger.debug(`Updated booking state:`, JSON.stringify(newState, null, 2));
  }

  private async findRelevantContext(query: string, options: ChatOptions) {
    try {
      const results = await this.semanticSearchService.searchByText(query, {
        limit: options.maxContextChunks,
        threshold: options.similarityThreshold,
      });

      if (results.length === 0 && options.similarityThreshold > 0.1) {
        const lowerThresholdResults = await this.semanticSearchService.searchByText(query, {
          limit: options.maxContextChunks * 2,
          threshold: 0.1,
        });

        return lowerThresholdResults.slice(0, options.maxContextChunks);
      }

      return results;
    } catch (error) {
      this.logger.error('Error finding relevant context', error instanceof Error ? error.stack : undefined);
      return [];
    }
  }

  private buildContext(chunks: Array<{ chunk: any; similarity: number }>): string {
    if (chunks.length === 0) {
      return 'No relevant context found in knowledge base.';
    }

    const contextParts = chunks.map((item, index) => {
      return `[Source ${index + 1}]:\n${item.chunk.content}`;
    });

    return contextParts.join('\n\n---\n\n');
  }

  private async getSystemPrompt(bookingState: BookingState): Promise<string> {
    const botSettings = await this.prisma.botSettings.findUnique({
      where: { id: 'default' },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toISOString().split('T')[0];
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    const todayFormatted = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    this.logger.log(`Current date context: Today=${todayStr}, Tomorrow=${tomorrowStr}, NextWeek=${nextWeekStr}`);

    let basePrompt = botSettings?.systemPrompt || `You are the AI concierge for Villa Limone, a boutique hotel on the Ligurian coast.
Be warm and helpful, reflecting Italian hospitality. Keep responses concise.

⚠️⚠️⚠️ CRITICAL: CURRENT DATE INFORMATION - USE THESE EXACT DATES ⚠️⚠️⚠️
RIGHT NOW: ${todayFormatted}
TODAY (YYYY-MM-DD): ${todayStr}
TOMORROW (YYYY-MM-DD): ${tomorrowStr}  ← Use this when user says "tomorrow" or "завтра"
NEXT WEEK (YYYY-MM-DD): ${nextWeekStr}  ← Use this when user says "next week" or "через неделю"

🚨 MANDATORY DATE CONVERSION RULES - READ CAREFULLY 🚨
1. When user says "tomorrow" or "завтра" → You MUST use: ${tomorrowStr}
2. When user says "next week" or "через неделю" → You MUST use: ${nextWeekStr}
3. When user says "today" or "сегодня" → You MUST use: ${todayStr}
4. NEVER use dates from 2023, 2024 (before ${todayStr}), or any past dates
5. If you see a date like "2023-10-06" or "2024-01-15" in conversation history, IGNORE IT - it's old data
6. ALWAYS calculate dates based on TODAY which is ${todayStr}
7. For "завтра на неделю" (tomorrow for a week) → checkIn=${tomorrowStr}, checkOut=${nextWeekStr}

CRITICAL: You MUST ALWAYS use one of the available functions to respond. You CANNOT respond with plain text - you must call a function for every interaction.

IMPORTANT: Always respond in the same language as the guest's message. If they write in Italian, respond in Italian. If they write in English, respond in English. If they write in German, respond in German, etc. You can speak any languages.

You have access to THREE functions that you MUST use. Follow this booking flow:

**BOOKING FLOW:**
1. When user expresses intent to book (e.g., "хочу забронировать", "want to book", "бронирование") AND provides dates → IMMEDIATELY call **check_availability**
2. After check_availability returns available rooms → Use **answer_question** to show rooms and collect missing info (name, email, room selection)
3. When user confirms booking AND you have ALL data (roomId from available rooms, name, email, dates, guests) → Call **create_reservation**
4. After create_reservation → Use **answer_question** to inform user of result

**FUNCTION USAGE:**

1. **check_availability**: Call IMMEDIATELY when:
   - User wants to book/reserve AND mentions dates (even relative like "tomorrow", "завтра")
   - User asks "is room X available" or "what rooms are available"
   - Convert relative dates to YYYY-MM-DD before calling

2. **create_reservation**: Call ONLY when:
   - You have ALL required data: roomId (MUST be the exact "id" UUID field from availableRooms array returned by check_availability, NOT the room name), guestName, guestEmail, checkIn (YYYY-MM-DD, use current date to convert relative dates), checkOut (YYYY-MM-DD), guestsCount
   - AND user explicitly confirmed (e.g., "yes", "confirm", "да", "подтверждаю", "бронируй")
   - Example: If check_availability returned [{"id": "abc-123", "name": "Suite Portofino", ...}], use roomId="abc-123", NOT "Suite Portofino"

3. **answer_question**: Use for:
   - General questions about hotel, amenities, policies
   - Recommendations
   - Collecting booking information when dates/details are missing
   - Communicating results after check_availability or create_reservation
   - All other interactions

Hotel info:
- Check-in: 3 PM, Check-out: 11 AM
- Breakfast: 7:30-10:30 AM
- Parking: Free, on-site
- Pets: Small pets welcome, €20/night
- Nearby: Cinque Terre (20 min), Portofino (15 min), Genoa (45 min)
- Beach: Private, 2 min walk

Format your responses using Markdown for better readability:
- Use **bold** for important information
- Use bullet points for lists
- Use ### for section headings when appropriate

If unsure, offer to have front desk follow up.`;

    if (Object.keys(bookingState).length > 0) {
      const checkInDate = bookingState.checkIn;
      const checkOutDate = bookingState.checkOut;
      const isOldDate = (dateStr: string | undefined) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return date < today;
      };
      
      const checkInDisplay = checkInDate && isOldDate(checkInDate) 
        ? `${checkInDate} (⚠️ OLD DATE - IGNORE, use ${tomorrowStr} for "tomorrow")` 
        : (checkInDate || 'Not provided');
      const checkOutDisplay = checkOutDate && isOldDate(checkOutDate)
        ? `${checkOutDate} (⚠️ OLD DATE - IGNORE, calculate from check-in)`
        : (checkOutDate || 'Not provided');
      
      basePrompt += `\n\nCurrent booking information collected:
${checkInDate ? `- Check-in: ${checkInDisplay}` : '- Check-in: Not provided'}
${checkOutDate ? `- Check-out: ${checkOutDisplay}` : '- Check-out: Not provided'}
${bookingState.guests ? `- Guests: ${bookingState.guests}` : '- Guests: Not provided'}
${bookingState.roomId ? `- Room selected (ID): ${bookingState.roomId}` : '- Room: Not selected'}
${bookingState.guestName ? `- Guest name: ${bookingState.guestName}` : '- Guest name: Not provided'}
${bookingState.guestEmail ? `- Guest email: ${bookingState.guestEmail}` : '- Guest email: Not provided'}

${bookingState.availableRooms && bookingState.availableRooms.length > 0 ? `\nAvailable rooms from check_availability (use the "id" field for create_reservation):
${bookingState.availableRooms.map((room, idx) => `${idx + 1}. ID: ${room.id}, Name: ${room.name}, Capacity: ${room.capacity}, Price per night: €${(room.pricePerNight / 100).toFixed(2)}, Total: €${(room.totalPrice / 100).toFixed(2)}`).join('\n')}` : ''}

CRITICAL BOOKING RULES - FOLLOW THIS SEQUENCE:

**STEP 1 - Check Availability:**
- If user wants to book AND provides dates → Call **check_availability** IMMEDIATELY
- Convert relative dates using the CURRENT DATE information at the top of this prompt:
  * "tomorrow" or "завтра" = ${tomorrowStr}
  * "next week" or "через неделю" = ${nextWeekStr}
  * "today" or "сегодня" = ${todayStr}
- NEVER use dates from 2023 or past - ALWAYS use dates from the CURRENT DATE section above
- This returns available rooms with IDs

**STEP 2 - Collect Information:**
- After check_availability, use **answer_question** to:
  - Show available rooms to user (they are listed above in "Available rooms")
  - Ask ONLY for missing information (check what's "Not provided" above)
  - DO NOT ask for information that is already provided above
  - If user provides name, email, or room selection in their message, remember it for next step
  - Confirm booking details with user

**STEP 3 - Create Reservation:**
- Call **create_reservation** IMMEDIATELY when BOTH conditions are met:
  1. You have ALL required data: 
     - roomId: MUST be the exact UUID "id" from the "Available rooms" list above (find the room by name if user mentioned it, then use its "id" field)
     - guestName: from conversation or "Not provided" above
     - guestEmail: from conversation or "Not provided" above
     - checkIn: from above (YYYY-MM-DD format)
     - checkOut: from above (YYYY-MM-DD format)
     - guestsCount: from above
  2. User explicitly confirms they want to proceed (words like: "yes", "confirm", "proceed", "book it", "да", "подтверждаю", "бронируй", "забронируй", "хочу забронировать")
- CRITICAL: The roomId must be the UUID from "Available rooms" list above. If user says "Suite Portofino", find it in the list and use its "id" field.
- CRITICAL: Use information from previous messages in the conversation. If user already provided name, email, or room selection earlier, use that information - DO NOT ask again.
- CRITICAL: If all data is present (either from above or from current/previous messages) AND user confirms, you MUST call **create_reservation** - do NOT use answer_question to say "booking will be confirmed" or "booking confirmed". The reservation will NOT exist unless you call create_reservation!
- After calling create_reservation, check result: if success=true, use **answer_question** to tell user the reservation was created. If error, use **answer_question** to inform user.

**IMPORTANT:**
- NEVER say "booking confirmed" or "бронирование подтверждено" without calling create_reservation first - it creates NO record in database!
- If user wants to book but you don't have dates yet → Use **answer_question** to ask for dates, then call **check_availability**
- If user provides dates but you haven't checked availability → Call **check_availability** first
- Always use a function - never respond with plain text`;
    }

    return basePrompt;
  }

  private buildUserPrompt(message: string, context: string, bookingState: BookingState): string {
    return `Context from hotel knowledge base:
${context}

---
Guest question: ${message}

Please provide a helpful answer based on the context above. If the information is not in the context, politely let the guest know and offer to have the front desk follow up.`;
  }

  private buildMessages(
    systemPrompt: string,
    userPrompt: string,
    history?: Array<{ role: string; content: string }>,
    conversation?: any,
  ): ChatMessage[] {
    const messages: ChatMessage[] = [];

    messages.push({
      role: 'system',
      content: systemPrompt,
    });

    if (conversation?.messages && conversation.messages.length > 0) {
      for (const msg of conversation.messages) {
        if (msg.role === 'SYSTEM') continue;

        if (msg.metadata && typeof msg.metadata === 'object') {
          const metadata = msg.metadata as any;
          if (metadata.functionCall) {
            messages.push({
              role: 'assistant',
              content: null,
              function_call: metadata.functionCall,
              name: metadata.toolCallId,
            });
            if (metadata.functionResult) {
              messages.push({
                role: 'function',
                name: metadata.toolCallId || metadata.functionCall.name,
                content: JSON.stringify(metadata.functionResult),
              });
            }
            continue;
          }
        }

        messages.push({
          role: msg.role.toLowerCase() === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    } else if (history && history.length > 0) {
      const filteredHistory = history.filter((msg) => msg.role !== 'system');
      for (const msg of filteredHistory) {
        messages.push({
          role: msg.role.toLowerCase() === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      }
    }

    messages.push({
      role: 'user',
      content: userPrompt,
    });

    return messages;
  }

  private async saveConversation(
    conversationId: string,
    userMessage: string,
    assistantMessage: string,
    functionResult?: any,
    functionCall?: any,
    toolCallId?: string,
  ) {
    try {
      const metadata: any = {};
      if (functionResult) {
        metadata.functionResult = functionResult;
      }
      if (functionCall) {
        metadata.functionCall = functionCall;
        if (toolCallId) {
          metadata.toolCallId = toolCallId;
        }
        this.logger.log(`Saving function call in message metadata: ${functionCall.name}, toolCallId: ${toolCallId || 'none'}`);
      }

      await this.prisma.message.createMany({
        data: [
          {
            conversationId,
            role: 'USER',
            content: userMessage,
          },
          {
            conversationId,
            role: 'ASSISTANT',
            content: assistantMessage,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
          },
        ],
      });

      this.logger.log(`Saved conversation messages. Function call saved: ${!!functionCall}`);

      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          messageCount: { increment: 2 },
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Error saving conversation', error instanceof Error ? error.stack : undefined);
    }
  }
}
