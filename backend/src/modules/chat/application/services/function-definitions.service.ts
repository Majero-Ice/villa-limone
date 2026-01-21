import { Injectable } from '@nestjs/common';
import { FunctionDefinition } from '../../../../shared/infrastructure/ai/interfaces/ai-provider.interface';

@Injectable()
export class FunctionDefinitionsService {
  getFunctionDefinitions(): FunctionDefinition[] {
    return [
      {
        name: 'check_availability',
        description:
          'Check which rooms are available for specific dates and number of guests. Call this function IMMEDIATELY when: 1) The user expresses intent to book/reserve a room (e.g., "хочу забронировать", "want to book", "бронирование", "reservation"), AND 2) The user provides or mentions check-in and check-out dates (even if relative like "tomorrow", "завтра", "next week"). Also call this when the user asks "is room X available" or "what rooms are available". Convert relative dates (tomorrow, next week, etc.) to YYYY-MM-DD format before calling. This function returns a list of available rooms. Each room object contains: id (the unique room ID you MUST use for create_reservation), name (room name for display), slug, capacity, pricePerNight, totalPrice, nights. IMPORTANT: When calling create_reservation later, you MUST use the exact "id" field from the room object, NOT the "name" field.',
        parameters: {
          type: 'object',
          properties: {
            checkIn: {
              type: 'string',
              description: 'Check-in date in YYYY-MM-DD format. CRITICAL: Use the CURRENT DATE provided in the system prompt to convert relative dates. If user says "tomorrow" or "завтра", use tomorrow\'s date from system prompt. NEVER use dates from 2023 or past years. Always use future dates based on the current date provided.',
            },
            checkOut: {
              type: 'string',
              description: 'Check-out date in YYYY-MM-DD format. CRITICAL: Use the CURRENT DATE provided in the system prompt to convert relative dates. Calculate based on check-in date + number of nights. NEVER use dates from 2023 or past years.',
            },
            guests: {
              type: 'number',
              description: 'Number of guests',
            },
          },
          required: ['checkIn', 'checkOut', 'guests'],
        },
      },
      {
        name: 'create_reservation',
        description:
          'CRITICAL: This is the ONLY way to actually save a reservation to the database. You MUST call this function to create a reservation - telling the user "booking confirmed" without calling this function means NO reservation exists. Call this function IMMEDIATELY when: 1) You have previously called check_availability and received available rooms (the result contains room objects with "id", "name", etc.), 2) You have ALL required data from conversation: roomId (MUST be the exact "id" field from the availableRooms array returned by check_availability - this is a UUID string, NOT the room name like "Suite Portofino"), guestName, guestEmail, checkIn (YYYY-MM-DD format, use current date context to convert relative dates), checkOut (YYYY-MM-DD format), guestsCount, AND 3) The user explicitly wants to proceed - they said words indicating confirmation like "yes", "confirm", "proceed", "book it", "да", "подтверждаю", "бронируй", "забронируй", "хочу забронировать" after you showed them the booking details. IMPORTANT: The roomId parameter must be the UUID from the "id" field of the room object from check_availability result, NOT the room name. DO NOT call this function if you are still collecting information. DO NOT call answer_question to "confirm" the booking - you MUST call create_reservation first. After calling, use answer_question only to inform the user of the result (success or error).',
        parameters: {
          type: 'object',
          properties: {
            roomId: {
              type: 'string',
              description: 'The exact UUID "id" field from the room object in the availableRooms array returned by check_availability. This is a UUID string (e.g., "550e8400-e29b-41d4-a716-446655440000"), NOT the room name like "Suite Portofino" or "Camera Limone". You must extract this from the check_availability result.',
            },
            guestName: {
              type: 'string',
              description: 'Full name of the guest',
            },
            guestEmail: {
              type: 'string',
              description: 'Email address of the guest',
            },
            checkIn: {
              type: 'string',
              description: 'Check-in date in YYYY-MM-DD format',
            },
            checkOut: {
              type: 'string',
              description: 'Check-out date in YYYY-MM-DD format',
            },
            guestsCount: {
              type: 'number',
              description: 'Number of guests',
            },
            specialRequests: {
              type: 'string',
              description: 'Any special requests from the guest (optional)',
            },
          },
          required: ['roomId', 'guestName', 'guestEmail', 'checkIn', 'checkOut', 'guestsCount'],
        },
      },
      {
        name: 'answer_question',
        description:
          'Use this function to answer general questions, provide information, have conversations, and guide users through the booking process. Use this function when: 1) Answering questions about hotel, rooms, amenities, policies, 2) Providing recommendations for local restaurants and activities, 3) Collecting booking information (name, email, dates, room preference) when the user wants to book but you don\'t have all details yet, 4) Confirming booking details with the user before calling create_reservation, 5) Responding after check_availability or create_reservation function calls to communicate results to the user. DO NOT use this function when you should call check_availability (user wants to book and provides dates) or create_reservation (all data collected and user confirmed).',
        parameters: {
          type: 'object',
          properties: {
            response: {
              type: 'string',
              description: 'Your response to the user\'s question or request. Provide helpful, warm, and informative answers in the same language as the user\'s message.',
            },
          },
          required: ['response'],
        },
      },
    ];
  }
}
