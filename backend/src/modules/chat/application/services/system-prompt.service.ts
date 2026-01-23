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

  async buildSystemPrompt(
    context: ConversationContext,
    settings?: { enableBooking: boolean; enableAvailability: boolean; enableRecommendations: boolean },
  ): Promise<string> {
    const botSettings = await this.prisma.botSettings.findUnique({
      where: { id: 'default' },
    });

    const template = botSettings?.systemPrompt || this.getDefaultPrompt();

    let basePrompt = this.replaceVariables(template, context, settings);

    if (context.knowledgeContext) {
      basePrompt = this.buildSystemPromptWithContext(basePrompt, context.knowledgeContext);
    }

    return basePrompt;
  }

  private buildSystemPromptWithContext(basePrompt: string, knowledgeContext: string): string {
    return `${basePrompt}

## Knowledge Base Context

Use the following information to answer the guest's question:

${knowledgeContext}

---

Remember: Only use information from the context above. Do not make up information.`;
  }

  private replaceVariables(
    template: string,
    context: ConversationContext,
    settings?: { enableBooking: boolean; enableAvailability: boolean; enableRecommendations: boolean },
  ): string {
    const tomorrow = new Date(context.currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let result = template;

    result = result.replace(/\$\{context\.currentDate\}/g, context.currentDate);
    result = result.replace(/\$\{context\.tomorrow\}/g, tomorrowStr);
    result = result.replace(/\$\{context\.availableRooms\}/g, this.formatAvailableRooms(context.availableRooms));
    result = result.replace(/\$\{context\.bookingState\}/g, JSON.stringify(context.bookingState, null, 2));

    if (settings) {
      const featuresSection = this.buildFeaturesAvailabilitySection(settings);
      result = result + '\n\n' + featuresSection;
    }

    return result;
  }

  private buildFeaturesAvailabilitySection(settings: { enableBooking: boolean; enableAvailability: boolean; enableRecommendations: boolean }): string {
    const sections: string[] = [];

    sections.push('═══════════════════════════════════════════════════════════════');
    sections.push('FEATURE AVAILABILITY');
    sections.push('═══════════════════════════════════════════════════════════════');

    if (!settings.enableBooking) {
      sections.push('');
      sections.push('⚠️ ONLINE BOOKING IS CURRENTLY DISABLED');
      sections.push('');
      sections.push('If a user asks to make a reservation, book a room, or wants to complete a booking:');
      sections.push('- Politely inform them that online booking is temporarily unavailable');
      sections.push('- Suggest they contact the hotel directly via phone or email');
      sections.push('- Be helpful and friendly, but clear that online booking is not available in language of user message');
      sections.push('- Example response: "Mi dispiace, online booking is currently unavailable. Please contact us directly at [phone/email] to make a reservation. We would be happy to assist you!"');
      sections.push('');
    }

    if (!settings.enableAvailability) {
      sections.push('');
      sections.push('⚠️ AVAILABILITY CHECKING IS CURRENTLY DISABLED');
      sections.push('');
      sections.push('If a user asks about room availability or wants to check dates:');
      sections.push('- Politely inform them that availability checking is temporarily unavailable');
      sections.push('- Suggest they contact the hotel directly for availability inquiries');
      sections.push('- Example response: "Mi dispiace, I cannot check availability at the moment. Please contact us directly for availability information."');
      sections.push('');
    }

    if (settings.enableBooking && settings.enableAvailability) {
      sections.push('');
      sections.push('✓ Online booking: Available');
      sections.push('✓ Availability checking: Available');
      sections.push('');
    }

    sections.push('═══════════════════════════════════════════════════════════════');

    return sections.join('\n');
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
    return `You are a friendly AI concierge for Villa Limone, a boutique hotel on the Ligurian coast of Italy.

Your role:
- Answer guest questions about the hotel, rooms, services, and local area
- Help with bookings and reservations
- Provide recommendations for activities, restaurants, and attractions
- Be warm, helpful, and knowledgeable

Guidelines:
- Answer ONLY based on the provided knowledge base context
- If information is not in the context, politely say you don't have that specific information and offer to help with something else
- Keep responses concise but friendly
- Use the guest's language (respond in the same language they write in)
- When mentioning prices, always include the currency (€)

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
