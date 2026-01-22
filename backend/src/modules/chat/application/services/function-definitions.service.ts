import { Injectable } from '@nestjs/common';
import { FunctionDefinition } from '../../../../shared/infrastructure/ai/interfaces/ai-provider.interface';

export interface BotSettings {
  enableBooking: boolean;
  enableAvailability: boolean;
  enableRecommendations: boolean;
}

@Injectable()
export class FunctionDefinitionsService {
  getFunctionDefinitions(settings?: BotSettings): FunctionDefinition[] {
    const functions: FunctionDefinition[] = [
      {
        name: 'respond',
        description: `General conversation response. Use for:
- Answering questions about hotel, rooms, amenities, policies, location
- Asking clarifying questions
- Presenting availability results from check_availability to user (ALWAYS use respond after check_availability)
- Presenting booking preview from create_reservation (PHASE 1) to user
- Any response that is not checking availability or creating a reservation
- Informing users when features are unavailable (e.g., if online booking is disabled, politely explain and suggest contacting the hotel directly)

IMPORTANT: 
- After check_availability returns results, you MUST use respond() to show available rooms to user and ask them to choose a room and provide their name and email. DO NOT call create_reservation immediately after check_availability.
- If a user asks to make a booking but online booking is disabled (you will see this in system prompt), use respond() to politely inform them that online booking is currently unavailable and suggest they contact the hotel directly.`,
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
    ];

    if (settings?.enableAvailability !== false) {
      functions.push({
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
      });
    }
    if (settings?.enableBooking !== false) {
      functions.push({
        name: 'create_reservation',
        description: `Create a room reservation. TWO-PHASE process:

IMPORTANT: You can ONLY call this function when you have ALL required information:
- User has selected a specific room (roomSlug)
- User has provided their full name (guestName)
- User has provided their email address (guestEmail)
- Dates are confirmed (checkIn, checkOut)
- Number of guests is known (guestsCount)

DO NOT call this function:
- After check_availability - you MUST first use respond() to show available rooms and ask user to choose
- Without guest name and email - you MUST ask for these details first using respond()
- Without user explicitly selecting a room - you MUST ask which room they want

PHASE 1 - Preview (confirm: false):
- Call ONLY when you have ALL required data (roomSlug, guestName, guestEmail, checkIn, checkOut, guestsCount)
- Call with confirm: false
- System returns preview summary
- You MUST show this preview to user using respond() and ask for confirmation
- Booking is NOT created yet

PHASE 2 - Confirm (confirm: true):  
- Call ONLY after user explicitly says yes/confirm/подтверждаю/да, бронируй/подтверждаю бронирование
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
      });
    }

    return functions;
  }
}
