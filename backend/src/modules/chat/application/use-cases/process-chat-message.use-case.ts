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
import { randomUUID } from 'crypto';
import { Price } from '../../../room/domain/value-objects/price.vo';
import { Reservation, ReservationStatus } from '../../../reservation/domain/entities/reservation.entity';

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

    const functions = this.functionDefinitions.getFunctionDefinitions();
    const systemPromptText = this.systemPrompt.buildSystemPrompt(context);

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

    const result = await this.processFunctionCall(response.functionCall, context, conversation.id);

    await this.conversationRepo.updateContext(conversation.id, {
      bookingState: context.bookingState,
      recentMessages: context.recentMessages.slice(-20),
    });

    let finalMessage = result.message;
    let needsSecondCall = false;

    if (result.needsRespond && !result.message) {
      needsSecondCall = true;
    }

    if (needsSecondCall && response.toolCallId) {
      const functionResult = JSON.stringify({
        success: !result.error,
        error: result.error,
        reservationId: result.reservationId,
        ...result.data,
      });

      const secondMessages: any[] = [
        { role: 'system', content: this.systemPrompt.buildSystemPrompt(context) },
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

      if (secondResponse.functionCall && secondResponse.functionCall.name === 'respond') {
        const respondArgs = JSON.parse(secondResponse.functionCall.arguments);
        finalMessage = respondArgs.message;
      } else if (secondResponse.content) {
        finalMessage = secondResponse.content;
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
  ): Promise<{ message?: string; data?: any; error?: string; needsRespond?: boolean; reservationId?: string; metadata?: any }> {
    const args = JSON.parse(functionCall.arguments);

    switch (functionCall.name) {
      case 'respond':
        return { message: args.message };

      case 'check_availability':
        return await this.handleCheckAvailability(args, context);

      case 'create_reservation':
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

    if (!args.confirm) {
      context.bookingState.step = 'awaiting_confirmation';
      context.bookingState.selectedRoom = args.roomSlug;
      context.bookingState.guestName = args.guestName;
      context.bookingState.guestEmail = args.guestEmail;
      context.bookingState.guests = args.guestsCount;
      context.bookingState.previewShown = true;

      return {
        data: {
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
        },
        needsRespond: true,
      };
    }

    if (!context.bookingState.previewShown) {
      return { 
        error: 'preview_not_shown',
        data: { message: 'Preview must be shown before confirmation' },
        needsRespond: true 
      };
    }

    if (context.bookingState.step !== 'awaiting_confirmation') {
      return { 
        error: 'invalid_state',
        data: { step: context.bookingState.step, message: 'Invalid booking state' },
        needsRespond: true 
      };
    }

    try {
      const roomEntity = await this.roomRepo.findBySlug(args.roomSlug);
      if (!roomEntity) {
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
      context.bookingState.step = 'confirmed';

      return {
        data: {
          success: true,
          reservationId: created.id,
          roomName: room.name,
          checkIn: args.checkIn,
          checkOut: args.checkOut,
          totalPrice,
          guestEmail: args.guestEmail,
          nights,
        },
        needsRespond: true,
        reservationId: created.id,
      };
    } catch (error) {
      this.logger.error(`Error creating reservation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { 
        error: 'creation_failed',
        data: { errorMessage: error instanceof Error ? error.message : 'Unknown error' },
        needsRespond: true 
      };
    }
  }
}
