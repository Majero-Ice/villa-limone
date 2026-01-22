import { Injectable, Inject, Logger } from '@nestjs/common';
import { ChatProvider } from '../../../../shared/infrastructure/ai/interfaces/ai-provider.interface';
import { AI_PROVIDER } from '../../../../shared/infrastructure/ai/ai.constants';
import { ChatRequestDto } from '../dtos/chat-request.dto';
import { ChatResponseDto } from '../dtos/chat-response.dto';
import { IConversationRepository, CONVERSATION_REPOSITORY } from '../../domain/repositories/conversation.repository.interface';
import { IRoomRepository, ROOM_REPOSITORY } from '../../../room/domain/repositories/room.repository.interface';
import { IReservationRepository, RESERVATION_REPOSITORY } from '../../../reservation/domain/repositories/reservation.repository.interface';
import { FunctionDefinitionsService } from '../services/function-definitions.service';
import { SystemPromptService, ConversationContext } from '../services/system-prompt.service';
import { RAGService } from '../services/rag.service';
import { randomUUID } from 'crypto';
import { Price } from '../../../room/domain/value-objects/price.vo';
import { Reservation, ReservationStatus } from '../../../reservation/domain/entities/reservation.entity';
import { IBotSettingsRepository, BOT_SETTINGS_REPOSITORY } from '../../../admin/domain/repositories/bot-settings.repository.interface';

@Injectable()
export class ProcessChatMessageUseCase {
  private readonly logger = new Logger(ProcessChatMessageUseCase.name);

  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepo: IConversationRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepo: IRoomRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepo: IReservationRepository,
    @Inject(AI_PROVIDER)
    private readonly chatProvider: ChatProvider,
    private readonly functionDefinitions: FunctionDefinitionsService,
    private readonly systemPrompt: SystemPromptService,
    private readonly ragService: RAGService,
    @Inject(BOT_SETTINGS_REPOSITORY)
    private readonly botSettingsRepo: IBotSettingsRepository,
  ) {}

  async execute(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const sessionId = dto.sessionId || randomUUID();

    let conversation = await this.conversationRepo.findBySessionId(sessionId);
    if (!conversation) {
      conversation = await this.conversationRepo.create(sessionId);
    }

    const context = await this.buildContext(conversation);

    context.recentMessages.push({
      role: 'user',
      content: dto.message,
      timestamp: new Date().toISOString(),
    });

    await this.conversationRepo.addMessage(conversation.id, {
      role: 'USER',
      content: dto.message,
    });

    const knowledgeResults = await this.ragService.retrieveRelevantKnowledge(dto.message, 5, 0.7);
    context.knowledgeContext = this.ragService.formatKnowledgeForPrompt(knowledgeResults);

    const botSettings = await this.botSettingsRepo.find();
    const settings = {
      enableBooking: botSettings?.enableBooking ?? true,
      enableAvailability: botSettings?.enableAvailability ?? true,
      enableRecommendations: botSettings?.enableRecommendations ?? true,
    };
    const functions = this.functionDefinitions.getFunctionDefinitions(settings);
    const systemPromptText = await this.systemPrompt.buildSystemPrompt(context, settings);

    const messages = [
      { role: 'system', content: systemPromptText },
      ...this.formatMessagesForOpenAI(context.recentMessages.slice(-20)),
    ];

    this.logger.debug(`Calling OpenAI with ${messages.length} messages and ${functions.length} functions`);

    const response = await this.chatProvider.chat(messages, 'gpt-4o-mini', functions);

    if (!response.functionCall) {
      this.logger.warn('OpenAI did not return a function call');
      return {
        message: "Mi scusi, I didn't understand. Could you rephrase?",
        sources: [],
        model: 'gpt-4o-mini',
      };
    }

    const result = await this.processFunctionCall(response.functionCall, context, conversation.id, settings);

    await this.conversationRepo.updateContext(conversation.id, {
      bookingState: context.bookingState,
      recentMessages: context.recentMessages.slice(-20),
    });

    this.logger.log(`[processFunctionCall] Function result:`, {
      hasMessage: !!result.message,
      message: result.message,
      needsRespond: result.needsRespond,
      hasError: !!result.error,
      error: result.error,
      hasData: !!result.data,
      data: result.data,
      reservationId: result.reservationId,
    });

    let finalMessage = result.message;
    let needsSecondCall = false;

    if (result.needsRespond && !result.message) {
      needsSecondCall = true;
      this.logger.log(`[processFunctionCall] needsRespond=true but no message, will make second call`);
    }

    if (needsSecondCall && response.toolCallId) {
      const functionResult = JSON.stringify({
        success: !result.error,
        error: result.error,
        reservationId: result.reservationId,
        ...result.data,
      });

      this.logger.log(`[processFunctionCall] Making second call with function result:`, functionResult);

      const secondMessages: any[] = [
        { role: 'system', content: await this.systemPrompt.buildSystemPrompt(context, settings) },
        ...this.formatMessagesForOpenAI(context.recentMessages.slice(-20)),
        {
          role: 'assistant',
          content: null,
          tool_calls: [
            {
              id: response.toolCallId,
              type: 'function',
              function: {
                name: response.functionCall.name,
                arguments: response.functionCall.arguments,
              },
            },
          ],
        },
        {
          role: 'tool',
          tool_call_id: response.toolCallId,
          content: functionResult,
        } as any,
      ];

      const secondResponse = await this.chatProvider.chat(secondMessages, 'gpt-4o-mini', functions);

      this.logger.log(`[processFunctionCall] Second response:`, {
        hasFunctionCall: !!secondResponse.functionCall,
        functionCallName: secondResponse.functionCall?.name,
        hasContent: !!secondResponse.content,
        content: secondResponse.content,
      });

      if (secondResponse.functionCall) {
        if (secondResponse.functionCall.name === 'respond') {
          const respondArgs = JSON.parse(secondResponse.functionCall.arguments);
          finalMessage = respondArgs.message;
          this.logger.log(`[processFunctionCall] Extracted message from respond function: ${finalMessage}`);
        } else {
          this.logger.log(`[processFunctionCall] Second response returned function ${secondResponse.functionCall.name}, processing it...`);
          const secondResult = await this.processFunctionCall(secondResponse.functionCall, context, conversation.id, settings);
          
          if (secondResult.message) {
            finalMessage = secondResult.message;
            this.logger.log(`[processFunctionCall] Got message from second function: ${finalMessage}`);
          } else if (secondResult.needsRespond && !secondResult.message) {
            this.logger.warn(`[processFunctionCall] Second function ${secondResponse.functionCall.name} needs respond but no message, making third call...`);
            
            if (secondResponse.toolCallId) {
              const thirdFunctionResult = JSON.stringify({
                success: !secondResult.error,
                error: secondResult.error,
                reservationId: secondResult.reservationId,
                ...secondResult.data,
              });

              const thirdMessages: any[] = [
                ...secondMessages,
                {
                  role: 'assistant',
                  content: null,
                  tool_calls: [
                    {
                      id: secondResponse.toolCallId,
                      type: 'function',
                      function: {
                        name: secondResponse.functionCall.name,
                        arguments: secondResponse.functionCall.arguments,
                      },
                    },
                  ],
                },
                {
                  role: 'tool',
                  tool_call_id: secondResponse.toolCallId,
                  content: thirdFunctionResult,
                } as any,
              ];

              const thirdResponse = await this.chatProvider.chat(thirdMessages, 'gpt-4o-mini', functions);
              
              if (thirdResponse.functionCall && thirdResponse.functionCall.name === 'respond') {
                const respondArgs = JSON.parse(thirdResponse.functionCall.arguments);
                finalMessage = respondArgs.message;
                this.logger.log(`[processFunctionCall] Got message from third call respond: ${finalMessage}`);
              } else if (thirdResponse.content) {
                finalMessage = thirdResponse.content;
                this.logger.log(`[processFunctionCall] Using third call direct content: ${finalMessage}`);
              }
            }
          }
          
          if (secondResult.reservationId) {
            result.reservationId = secondResult.reservationId;
          }
        }
      } else if (secondResponse.content) {
        finalMessage = secondResponse.content;
        this.logger.log(`[processFunctionCall] Using direct content: ${finalMessage}`);
      } else {
        this.logger.warn(`[processFunctionCall] Second response has no function call or content!`);
      }
    }

    context.recentMessages.push({
      role: 'assistant',
      content: finalMessage || '',
      timestamp: new Date().toISOString(),
    });

    await this.conversationRepo.addMessage(conversation.id, {
      role: 'ASSISTANT',
      content: finalMessage || '',
      metadata: result.metadata,
    });

    const responseDto: ChatResponseDto = {
      message: finalMessage || '',
      sources: [],
      model: 'gpt-4o-mini',
      functionCall: {
        name: response.functionCall.name,
        arguments: response.functionCall.arguments,
      },
    };

    if (result.reservationId) {
      responseDto.reservationId = result.reservationId;
      await this.conversationRepo.updateContext(conversation.id, {
        bookingState: { ...context.bookingState, step: 'confirmed' },
        recentMessages: context.recentMessages.slice(-20),
      });
    }

    return responseDto;
  }

  private async buildContext(conversation: any): Promise<ConversationContext> {
    const rooms = await this.roomRepo.findAllActive();

    const savedContext = conversation.metadata || {};
    const bookingState = savedContext.bookingState || {
      step: 'idle',
      checkIn: null,
      checkOut: null,
      guests: null,
      selectedRoom: null,
      guestName: null,
      guestEmail: null,
      availabilityResult: null,
      previewShown: false,
    };

    const recentMessages = conversation.messages?.slice(-20).map((msg: any) => ({
      role: msg.role === 'USER' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.createdAt.toISOString(),
    })) || [];

    return {
      conversationId: conversation.id,
      sessionId: conversation.sessionId,
      currentDate: new Date().toISOString().split('T')[0],
      availableRooms: rooms.map((r) => ({
        slug: r.slug,
        name: r.name,
        description: r.description,
        pricePerNight: r.pricePerNight.inEuros,
        maxGuests: r.capacity,
        features: r.features,
        imageUrl: r.imageUrl,
      })),
      bookingState,
      recentMessages,
    };
  }

  private formatMessagesForOpenAI(messages: Array<{ role: string; content: string }>): Array<{ role: string; content: string }> {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  private async processFunctionCall(
    functionCall: { name: string; arguments: string },
    context: ConversationContext,
    conversationId: string,
    settings?: { enableBooking: boolean; enableAvailability: boolean; enableRecommendations: boolean },
  ): Promise<{ message?: string; data?: any; error?: string; needsRespond?: boolean; reservationId?: string; metadata?: any }> {
    this.logger.log(`[processFunctionCall] Processing function: ${functionCall.name}`);
    this.logger.debug(`[processFunctionCall] Raw arguments: ${functionCall.arguments}`);
    
    const args = JSON.parse(functionCall.arguments);
    this.logger.log(`[processFunctionCall] Parsed arguments:`, args);

    switch (functionCall.name) {
      case 'respond':
        return { message: args.message };

      case 'check_availability':
        if (settings?.enableAvailability === false) {
          this.logger.warn(`[processFunctionCall] check_availability called but is disabled`);
          return {
            error: 'feature_disabled',
            data: { message: 'Availability checking is currently disabled. Please contact the hotel directly for availability inquiries.' },
            needsRespond: true,
          };
        }
        return await this.handleCheckAvailability(args, context);

      case 'create_reservation':
        if (settings?.enableBooking === false) {
          this.logger.warn(`[processFunctionCall] create_reservation called but is disabled`);
          return {
            error: 'feature_disabled',
            data: { message: 'Online booking is currently disabled. Please contact the hotel directly to make a reservation.' },
            needsRespond: true,
          };
        }
        // Normalize confirm parameter - OpenAI might send it as string "true"/"false"
        if (typeof args.confirm === 'string') {
          args.confirm = args.confirm === 'true' || args.confirm === '1';
          this.logger.log(`[processFunctionCall] Normalized confirm from string to boolean: ${args.confirm}`);
        }
        return await this.handleCreateReservation(args, context, conversationId);

      default:
        return { error: 'Unknown function', needsRespond: true };
    }
  }

  private async handleCheckAvailability(
    args: { checkIn: string; checkOut: string; guests?: number },
    context: ConversationContext,
  ): Promise<{ data?: any; error?: string; needsRespond: boolean }> {
    const checkIn = new Date(args.checkIn);
    const checkOut = new Date(args.checkOut);
    const today = new Date(context.currentDate);

    if (checkIn < today) {
      return { 
        error: 'check_in_past',
        data: { checkIn: args.checkIn, message: 'Check-in date cannot be in the past' },
        needsRespond: true 
      };
    }
    if (checkOut <= checkIn) {
      return { 
        error: 'invalid_dates',
        data: { checkIn: args.checkIn, checkOut: args.checkOut, message: 'Check-out must be after check-in' },
        needsRespond: true 
      };
    }

    const guests = args.guests || 2;

    const available = await this.roomRepo.findAvailable(checkIn, checkOut, guests);
    const allRooms = context.availableRooms;
    const availableSlugs = available.map((r) => r.slug);
    const unavailable = allRooms.filter((r) => !availableSlugs.includes(r.slug)).map((r) => r.slug);

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    context.bookingState.step = 'checking_availability';
    context.bookingState.checkIn = args.checkIn;
    context.bookingState.checkOut = args.checkOut;
    context.bookingState.guests = guests;
    context.bookingState.availabilityResult = {
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      nights,
      available: available.map((room) => ({
        room: {
          slug: room.slug,
          name: room.name,
          description: room.description,
          pricePerNight: room.pricePerNight.inEuros,
          maxGuests: room.capacity,
          features: room.features,
          imageUrl: room.imageUrl,
        },
        totalPrice: room.pricePerNight.inEuros * nights,
      })),
      unavailable,
    };

    return {
      data: {
        checkIn: args.checkIn,
        checkOut: args.checkOut,
        nights,
        guests,
        available: context.bookingState.availabilityResult.available,
        unavailable,
        hasRooms: available.length > 0,
      },
      needsRespond: true,
    };
  }

  private async handleCreateReservation(
    args: {
      roomSlug: string;
      checkIn: string;
      checkOut: string;
      guestName: string;
      guestEmail: string;
      guestsCount: number;
      confirm: boolean;
    },
    context: ConversationContext,
    conversationId: string,
  ): Promise<{ data?: any; error?: string; needsRespond: boolean; reservationId?: string }> {
    this.logger.log(`[create_reservation] Received function call with args:`, {
      roomSlug: args.roomSlug,
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      guestName: args.guestName,
      guestEmail: args.guestEmail,
      guestsCount: args.guestsCount,
      confirm: args.confirm,
      confirmType: typeof args.confirm,
    });

    this.logger.log(`[create_reservation] Current booking state:`, {
      step: context.bookingState.step,
      previewShown: context.bookingState.previewShown,
      selectedRoom: context.bookingState.selectedRoom,
    });

    // Validate all required fields are present
    if (!args.roomSlug || !args.checkIn || !args.checkOut || !args.guestName || !args.guestEmail || args.guestsCount === undefined) {
      const missingFields = [];
      if (!args.roomSlug) missingFields.push('roomSlug');
      if (!args.checkIn) missingFields.push('checkIn');
      if (!args.checkOut) missingFields.push('checkOut');
      if (!args.guestName) missingFields.push('guestName');
      if (!args.guestEmail) missingFields.push('guestEmail');
      if (args.guestsCount === undefined) missingFields.push('guestsCount');
      
      this.logger.warn(`[create_reservation] Missing required fields: ${missingFields.join(', ')}`);
      return {
        error: 'missing_required_fields',
        data: {
          missingFields,
          message: `Cannot create reservation: missing ${missingFields.join(', ')}. Please ask user for this information first.`,
        },
        needsRespond: true,
      };
    }

    const room = context.availableRooms.find((r) => r.slug === args.roomSlug);
    if (!room) {
      return { 
        error: 'room_not_found',
        data: { roomSlug: args.roomSlug, availableRooms: context.availableRooms.map(r => r.name) },
        needsRespond: true 
      };
    }

    if (args.guestsCount > room.maxGuests) {
      return { 
        error: 'capacity_exceeded',
        data: { roomName: room.name, maxGuests: room.maxGuests, requestedGuests: args.guestsCount },
        needsRespond: true 
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.guestEmail)) {
      return { 
        error: 'invalid_email',
        data: { email: args.guestEmail },
        needsRespond: true 
      };
    }

    const checkIn = new Date(args.checkIn);
    const checkOut = new Date(args.checkOut);
    const today = new Date(context.currentDate);

    if (checkIn < today || checkOut <= checkIn) {
      return { 
        error: 'invalid_dates',
        data: { checkIn: args.checkIn, checkOut: args.checkOut },
        needsRespond: true 
      };
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * nights;

    this.logger.log(`[create_reservation] Calculated: nights=${nights}, totalPrice=${totalPrice}`);
    this.logger.log(`[create_reservation] confirm value: ${args.confirm} (type: ${typeof args.confirm})`);

    if (!args.confirm) {
      this.logger.log(`[create_reservation] PHASE 1: Generating preview (confirm=false)`);
      this.logger.log(`[create_reservation] PHASE 1: NOT creating reservation in database - preview only`);
      
      context.bookingState.step = 'awaiting_confirmation';
      context.bookingState.selectedRoom = args.roomSlug;
      context.bookingState.guestName = args.guestName;
      context.bookingState.guestEmail = args.guestEmail;
      context.bookingState.guests = args.guestsCount;
      context.bookingState.previewShown = true;

      const previewData = {
        preview: true,
        room: {
          name: room.name,
          slug: room.slug,
        },
        checkIn: args.checkIn,
        checkOut: args.checkOut,
        nights,
        guestsCount: args.guestsCount,
        guestName: args.guestName,
        guestEmail: args.guestEmail,
        totalPrice,
      };

      this.logger.log(`[create_reservation] PHASE 1: Returning preview data:`, previewData);
      this.logger.log(`[create_reservation] PHASE 1: No reservation created - this is correct behavior`);

      return {
        data: previewData,
        needsRespond: true,
      };
    }

    this.logger.log(`[create_reservation] PHASE 2: Confirming reservation (confirm=true)`);

    if (!context.bookingState.previewShown) {
      this.logger.warn(`[create_reservation] PHASE 2: Preview not shown! previewShown=${context.bookingState.previewShown}`);
      return { 
        error: 'preview_not_shown',
        data: { message: 'Preview must be shown before confirmation' },
        needsRespond: true 
      };
    }

    if (context.bookingState.step !== 'awaiting_confirmation') {
      this.logger.warn(`[create_reservation] PHASE 2: Invalid state! step=${context.bookingState.step}, expected=awaiting_confirmation`);
      return { 
        error: 'invalid_state',
        data: { step: context.bookingState.step, message: 'Invalid booking state' },
        needsRespond: true 
      };
    }

    try {
      this.logger.log(`[create_reservation] PHASE 2: Creating reservation in database...`);
      const roomEntity = await this.roomRepo.findBySlug(args.roomSlug);
      if (!roomEntity) {
        this.logger.error(`[create_reservation] PHASE 2: Room not found: ${args.roomSlug}`);
        return { 
          error: 'room_not_found',
          data: { roomSlug: args.roomSlug },
          needsRespond: true 
        };
      }

      const reservation = Reservation.create({
        id: randomUUID(),
        roomId: roomEntity.id,
        guestName: args.guestName,
        guestEmail: args.guestEmail,
        checkIn,
        checkOut,
        guestsCount: args.guestsCount,
        totalPrice: Price.fromCents(totalPrice * 100),
        status: ReservationStatus.PENDING,
        specialRequests: undefined,
        conversationId,
      });

      const created = await this.reservationRepo.create(reservation);
      this.logger.log(`[create_reservation] PHASE 2: Reservation created successfully: ${created.id}`);
      context.bookingState.step = 'confirmed';

      const resultData = {
        success: true,
        reservationId: created.id,
        roomName: room.name,
        checkIn: args.checkIn,
        checkOut: args.checkOut,
        totalPrice,
        guestEmail: args.guestEmail,
        nights,
      };

      this.logger.log(`[create_reservation] PHASE 2: Returning result data:`, resultData);

      return {
        data: resultData,
        needsRespond: true,
        reservationId: created.id,
      };
    } catch (error) {
      this.logger.error(`[create_reservation] PHASE 2: Error creating reservation: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      return { 
        error: 'creation_failed',
        data: { errorMessage: error instanceof Error ? error.message : 'Unknown error' },
        needsRespond: true 
      };
    }
  }
}
