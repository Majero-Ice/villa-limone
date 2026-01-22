import { Injectable } from '@nestjs/common';
import { FunctionDefinition } from '../../../../shared/infrastructure/ai/interfaces/ai-provider.interface';

@Injectable()
export class FunctionDefinitionsService {
  getFunctionDefinitions(): FunctionDefinition[] {
    return [
      {
        name: 'respond',
        description: `General conversation response. Use for:
- Answering questions about hotel, rooms, amenities, policies, location
- Asking clarifying questions
- Any response that is not checking availability or creating a reservation
- Presenting availability results or booking preview to user`,
        parameters: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message to send to user on his language',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'check_availability',
        description: `Check room availability for specific dates. 
Call this ONLY when:
- User provides specific check-in AND check-out dates
- Or user provides check-in date and duration (e.g., "3 nights")

Do NOT call if dates are vague - ask for clarification first using respond function.`,
        parameters: {
          type: 'object',
          properties: {
            checkIn: {
              type: 'string',
              description: 'Check-in date in YYYY-MM-DD format. Convert relative dates using currentDate from context.',
            },
            checkOut: {
              type: 'string',
              description: 'Check-out date in YYYY-MM-DD format',
            },
            guests: {
              type: 'integer',
              description: 'Number of guests. Default 2 if not specified.',
            },
          },
          required: ['checkIn', 'checkOut'],
        },
      },
      {
        name: 'create_reservation',
        description: `Create a room reservation. TWO-PHASE process:

PHASE 1 - Preview (confirm: false):
- Call with all booking details + confirm: false
- System returns preview summary
- You MUST show this preview to user and ask for confirmation
- Booking is NOT created yet

PHASE 2 - Confirm (confirm: true):  
- Call ONLY after user explicitly says yes/confirm/подтверждаю/да, бронируй
- Call with same details + confirm: true
- System creates actual booking and returns result with "reservationId" field

CRITICAL: After Phase 2, the function returns a result object with "reservationId" field containing the actual database ID. You MUST use this EXACT reservationId in your response to the user. Include it clearly in your message (e.g., "Your reservation ID is: [reservationId]" or "ID бронирования: [reservationId]"). DO NOT make up or invent reservation IDs.

NEVER skip Phase 1. NEVER call Phase 2 without explicit user confirmation.`,
        parameters: {
          type: 'object',
          properties: {
            roomSlug: {
              type: 'string',
              description: 'Room slug from availableRooms (e.g., "camera-mare")',
            },
            checkIn: {
              type: 'string',
              description: 'Check-in date YYYY-MM-DD',
            },
            checkOut: {
              type: 'string',
              description: 'Check-out date YYYY-MM-DD',
            },
            guestName: {
              type: 'string',
              description: 'Full name of guest making the reservation',
            },
            guestEmail: {
              type: 'string',
              description: 'Guest email for confirmation',
            },
            guestsCount: {
              type: 'integer',
              description: 'Number of guests',
            },
            confirm: {
              type: 'boolean',
              description: 'false = generate preview only, true = create actual booking',
            },
          },
          required: ['roomSlug', 'checkIn', 'checkOut', 'guestName', 'guestEmail', 'guestsCount', 'confirm'],
        },
      },
    ];
  }
}
