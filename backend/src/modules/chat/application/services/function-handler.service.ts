import { Injectable, Inject, Logger } from '@nestjs/common';
import { FunctionCall } from '../../../../shared/infrastructure/ai/interfaces/ai-provider.interface';
import { CheckAvailabilityUseCase } from '../../../reservation/application/use-cases/check-availability.use-case';
import { CreateReservationUseCase } from '../../../reservation/application/use-cases/create-reservation.use-case';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class FunctionHandlerService {
  private readonly logger = new Logger(FunctionHandlerService.name);

  constructor(
    private readonly checkAvailability: CheckAvailabilityUseCase,
    private readonly createReservation: CreateReservationUseCase,
    private readonly prisma: PrismaService,
  ) {}

  async handleFunctionCall(
    functionCall: FunctionCall,
    conversationId?: string,
  ): Promise<{ result: any; shouldContinue: boolean }> {
    this.logger.log(`Calling function: ${functionCall.name}`, {
      arguments: functionCall.arguments,
      conversationId,
    });

    try {
      const args = JSON.parse(functionCall.arguments);

      if (functionCall.name === 'check_availability') {
        const availability = await this.checkAvailability.execute({
          checkIn: args.checkIn,
          checkOut: args.checkOut,
          guests: args.guests,
        });

        this.logger.log(`Availability check completed: ${availability.availableRooms.length} rooms available`);

        return {
          result: {
            availableRooms: availability.availableRooms.map((room) => ({
              id: room.id,
              slug: room.slug,
              name: room.name,
              capacity: room.capacity,
              pricePerNight: room.pricePerNight,
              totalPrice: room.totalPrice,
              nights: room.nights,
            })),
          },
          shouldContinue: true,
        };
      }

      if (functionCall.name === 'create_reservation') {
        if (!conversationId) {
          const error = 'Conversation ID is required for creating reservations';
          this.logger.error(error);
          return {
            result: {
              success: false,
              error: error,
            },
            shouldContinue: true,
          };
        }

        this.logger.log(`Creating reservation:`, {
          roomId: args.roomId,
          guestName: args.guestName,
          guestEmail: args.guestEmail,
          checkIn: args.checkIn,
          checkOut: args.checkOut,
          guestsCount: args.guestsCount,
        });

        const reservation = await this.createReservation.execute({
          roomId: args.roomId,
          guestName: args.guestName,
          guestEmail: args.guestEmail,
          checkIn: args.checkIn,
          checkOut: args.checkOut,
          guestsCount: args.guestsCount,
          specialRequests: args.specialRequests,
          conversationId,
        });

        await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { hasReservation: true },
        });

        this.logger.log(`Reservation created successfully: ${reservation.id}`);

        return {
          result: {
            success: true,
            reservationId: reservation.id,
            message: 'Reservation created successfully. The booking has been confirmed in the system.',
            reservation: {
              id: reservation.id,
              roomId: reservation.roomId,
              guestName: reservation.guestName,
              checkIn: reservation.checkIn,
              checkOut: reservation.checkOut,
              guestsCount: reservation.guestsCount,
              totalPrice: reservation.totalPrice,
              status: reservation.status,
            },
          },
          shouldContinue: true,
        };
      }

      if (functionCall.name === 'answer_question') {
        this.logger.log(`Answering question with response (${args.response.length} chars)`);
        return {
          result: {
            success: true,
            response: args.response,
          },
          shouldContinue: false,
        };
      }

      const error = `Unknown function: ${functionCall.name}`;
      this.logger.error(error);
      return {
        result: {
          success: false,
          error: error,
        },
        shouldContinue: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Error executing ${functionCall.name}: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      return {
        result: {
          success: false,
          error: errorMessage,
          message: `Failed to execute ${functionCall.name}: ${errorMessage}`,
        },
        shouldContinue: true,
      };
    }
  }
}
