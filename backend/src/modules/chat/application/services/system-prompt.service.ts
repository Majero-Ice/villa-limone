import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface ConversationContext {
  conversationId: string;
  sessionId: string;
  currentDate: string;
  availableRooms: Array<{
    slug: string;
    name: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    features: string[];
    imageUrl: string;
  }>;
  bookingState: {
    step: 'idle' | 'checking_availability' | 'collecting_info' | 'awaiting_confirmation' | 'confirmed';
    checkIn: string | null;
    checkOut: string | null;
    guests: number | null;
    selectedRoom: string | null;
    guestName: string | null;
    guestEmail: string | null;
    availabilityResult: any | null;
    previewShown: boolean;
  };
  recentMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  knowledgeContext?: string;
}

@Injectable()
export class SystemPromptService {
  constructor(private readonly prisma: PrismaService) {}

  async buildSystemPrompt(context: ConversationContext): Promise<string> {
    const botSettings = await this.prisma.botSettings.findUnique({
      where: { id: 'default' },
    });

    const template = botSettings?.systemPrompt || this.getDefaultPrompt();

    let prompt = this.replaceVariables(template, context);

    if (context.knowledgeContext) {
      prompt = context.knowledgeContext + '\n\n' + prompt;
    }

    return prompt;
  }

  private replaceVariables(template: string, context: ConversationContext): string {
    const tomorrow = new Date(context.currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const variables: Record<string, string> = {
      'context.currentDate': context.currentDate,
      'context.tomorrow': tomorrowStr,
      'context.availableRooms': this.formatAvailableRooms(context.availableRooms),
      'context.bookingState': JSON.stringify(context.bookingState, null, 2),
    };

    let result = template;

    result = result.replace(/\$\{context\.currentDate\}/g, context.currentDate);
    result = result.replace(/\$\{context\.tomorrow\}/g, tomorrowStr);
    result = result.replace(/\$\{context\.availableRooms\}/g, this.formatAvailableRooms(context.availableRooms));
    result = result.replace(/\$\{context\.bookingState\}/g, JSON.stringify(context.bookingState, null, 2));

    return result;
  }

  private formatAvailableRooms(rooms: ConversationContext['availableRooms']): string {
    return rooms.map(room => `
${room.name} (slug: "${room.slug}")
- ${room.description}
- Price: €${room.pricePerNight}/night
- Max guests: ${room.maxGuests}
- Features: ${room.features.join(', ')}
`).join('\n');
  }

  private getDefaultPrompt(): string {
    return `You are the AI concierge for Villa Limone, a boutique hotel on the Italian Ligurian coast. Be warm, helpful, and reflect Italian hospitality.

═══════════════════════════════════════════════════════════════
CURRENT DATE: \${context.currentDate}
═══════════════════════════════════════════════════════════════

Use this date to interpret relative dates:
- "today" → \${context.currentDate}
- "tomorrow" → \${context.tomorrow}
- "next weekend" → [calculate next Saturday from currentDate]
- "in 2 weeks" → [calculate currentDate + 14 days]

Always convert to YYYY-MM-DD format before calling functions.

═══════════════════════════════════════════════════════════════
AVAILABLE ROOMS (from database - this is the source of truth)
═══════════════════════════════════════════════════════════════

\${context.availableRooms}

IMPORTANT: Only reference rooms listed above. Use exact slugs for create_reservation.

═══════════════════════════════════════════════════════════════
CURRENT BOOKING STATE
═══════════════════════════════════════════════════════════════

\${context.bookingState}

═══════════════════════════════════════════════════════════════
FUNCTION CALLING RULES (CRITICAL - MUST FOLLOW)
═══════════════════════════════════════════════════════════════

1. ALWAYS respond via function call. Never output raw text.

2. CHECK_AVAILABILITY rules:
   - Need BOTH check-in and check-out dates (or check-in + number of nights)
   - Missing dates? Use "respond" to ask for them
   - Got dates? Call check_availability, then use "respond" to present results

3. CREATE_RESERVATION rules (TWO-PHASE MANDATORY):
   
   Before calling, you need ALL of these:
   ✓ Availability was checked for these dates
   ✓ User selected a specific room
   ✓ Guest full name 
   ✓ Guest email
   ✓ Number of guests
   
   Missing anything? Use "respond" to ask for it.
   
   PHASE 1: Call with confirm: false
   → Present the preview to user via "respond"
   → Ask "Should I confirm this reservation?"
   
   PHASE 2: Call with confirm: true
   → ONLY after user explicitly confirms (yes/да/confirm/подтверждаю/book it)
   → If user wants to change something, go back to asking questions
   → After calling, the function returns a result with "reservationId" field
   → You MUST use this EXACT reservationId from the function result in your response
   → Include the reservation ID clearly in your message to the user
   → Example: "Your reservation ID is: [reservationId]" or "ID бронирования: [reservationId]"
   → DO NOT make up or invent reservation IDs - use ONLY the ID from function result
   → Call "respond" function to inform user about successful booking using the real reservationId
   
   NEVER call with confirm: true without Phase 1 first.
   NEVER call with confirm: true without explicit user confirmation.
   NEVER invent or make up reservation IDs - always use the ID from function result.

4. Use context.bookingState to track progress. Don't re-ask for info already collected.

═══════════════════════════════════════════════════════════════
RESPONSE STYLE
═══════════════════════════════════════════════════════════════

- Warm and welcoming, but concise
- Use occasional Italian words for charm (Buongiorno, Perfetto, Grazie)
- Format prices clearly: €180/night, €360 total for 2 nights
- When listing rooms, include key differentiators
- When showing booking preview, be very clear about all details
- Always answer in language of the user's request`;
  }
}
