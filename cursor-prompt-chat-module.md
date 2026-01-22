# Task: Implement AI Chat Module with OpenAI Function Calling

## Context

Implementing chat module for Villa Limone hotel. Backend is NestJS with DDD architecture. The chatbot helps users ask questions and make reservations.

## Critical Architecture Decisions

### 1. MUST use OpenAI Function Calling

All AI responses go through function calls. GPT decides which function to call. NO regex, NO string matching for intent detection. Ever.

### 2. All Hotel Data Comes from Database

AI must NOT have hardcoded room info. Before responding about rooms, availability, or prices — fetch from database and inject into context. Rooms can change, prices can change.

### 3. Shared Conversation Context

Every function receives the same context object. Context persists between messages and function calls within a conversation. Store in database.

### 4. Two-Phase Booking

`create_reservation` requires two calls:
- First call: `confirm: false` → returns preview, nothing saved
- Second call: `confirm: true` → only after user explicitly confirms → creates booking

---

## Implementation Spec

### Conversation Context Schema

```typescript
interface ConversationContext {
  conversationId: string;
  sessionId: string;
  
  // Current date (set on each request)
  currentDate: string; // YYYY-MM-DD
  
  // Hotel data (fetched from DB at start of each request)
  availableRooms: RoomInfo[];
  
  // Booking flow state
  bookingState: {
    step: 'idle' | 'checking_availability' | 'collecting_info' | 'awaiting_confirmation' | 'confirmed';
    checkIn: string | null;
    checkOut: string | null;
    guests: number | null;
    selectedRoom: string | null; // room slug
    guestName: string | null;
    guestEmail: string | null;
    availabilityResult: AvailabilityResult | null;
    previewShown: boolean;
  };
  
  // Message history (last N messages for context)
  recentMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

interface RoomInfo {
  slug: string;
  name: string;
  description: string;
  pricePerNight: number; // euros
  maxGuests: number;
  features: string[];
  imageUrl: string;
}

interface AvailabilityResult {
  checkIn: string;
  checkOut: string;
  nights: number;
  available: Array<{
    room: RoomInfo;
    totalPrice: number;
  }>;
  unavailable: string[]; // room slugs
}
```

### Function Definitions

```typescript
const functions: ChatCompletionFunction[] = [
  {
    name: "respond",
    description: `General conversation response. Use for:
- Answering questions about hotel, rooms, amenities, policies, location
- Asking clarifying questions
- Any response that is not checking availability or creating a reservation
- Presenting availability results or booking preview to user`,
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Response message to send to user"
        }
      },
      required: ["message"]
    }
  },
  
  {
    name: "check_availability", 
    description: `Check room availability for specific dates. 
Call this ONLY when:
- User provides specific check-in AND check-out dates
- Or user provides check-in date and duration (e.g., "3 nights")

Do NOT call if dates are vague - ask for clarification first using respond function.`,
    parameters: {
      type: "object",
      properties: {
        checkIn: {
          type: "string",
          description: "Check-in date in YYYY-MM-DD format. Convert relative dates using currentDate from context."
        },
        checkOut: {
          type: "string",
          description: "Check-out date in YYYY-MM-DD format"
        },
        guests: {
          type: "integer",
          description: "Number of guests. Default 2 if not specified."
        }
      },
      required: ["checkIn", "checkOut"]
    }
  },
  
  {
    name: "create_reservation",
    description: `Create a room reservation. TWO-PHASE process:

PHASE 1 - Preview (confirm: false):
- Call with all booking details + confirm: false
- System returns preview summary
- You MUST show this preview to user and ask for confirmation
- Booking is NOT created yet

PHASE 2 - Confirm (confirm: true):  
- Call ONLY after user explicitly says yes/confirm/подтверждаю/да, бронируй
- Call with same details + confirm: true
- System creates actual booking and returns reservation ID

NEVER skip Phase 1. NEVER call Phase 2 without explicit user confirmation.`,
    parameters: {
      type: "object",
      properties: {
        roomSlug: {
          type: "string",
          description: "Room slug from availableRooms (e.g., 'camera-mare')"
        },
        checkIn: {
          type: "string",
          description: "Check-in date YYYY-MM-DD"
        },
        checkOut: {
          type: "string",
          description: "Check-out date YYYY-MM-DD"
        },
        guestName: {
          type: "string",
          description: "Full name of guest making the reservation"
        },
        guestEmail: {
          type: "string",
          description: "Guest email for confirmation"
        },
        guestsCount: {
          type: "integer",
          description: "Number of guests"
        },
        confirm: {
          type: "boolean",
          description: "false = generate preview only, true = create actual booking"
        }
      },
      required: ["roomSlug", "checkIn", "checkOut", "guestName", "guestEmail", "guestsCount", "confirm"]
    }
  }
];
```

### System Prompt Builder

```typescript
function buildSystemPrompt(context: ConversationContext): string {
  return `You are the AI concierge for Villa Limone, a boutique hotel on the Italian Ligurian coast. Be warm, helpful, and reflect Italian hospitality.

═══════════════════════════════════════════════════════════════
CURRENT DATE: ${context.currentDate}
═══════════════════════════════════════════════════════════════

Use this date to interpret relative dates:
- "today" → ${context.currentDate}
- "tomorrow" → [calculate currentDate + 1 day]
- "next weekend" → [calculate next Saturday from currentDate]
- "in 2 weeks" → [calculate currentDate + 14 days]

Always convert to YYYY-MM-DD format before calling functions.

═══════════════════════════════════════════════════════════════
AVAILABLE ROOMS (from database - this is the source of truth)
═══════════════════════════════════════════════════════════════

${context.availableRooms.map(room => `
${room.name} (slug: "${room.slug}")
- ${room.description}
- Price: €${room.pricePerNight}/night
- Max guests: ${room.maxGuests}
- Features: ${room.features.join(', ')}
`).join('\n')}

IMPORTANT: Only reference rooms listed above. Use exact slugs for create_reservation.

═══════════════════════════════════════════════════════════════
HOTEL POLICIES
═══════════════════════════════════════════════════════════════

- Check-in: 3:00 PM
- Check-out: 11:00 AM  
- Breakfast: 7:30 AM - 10:30 AM (included in room rate)
- Parking: Free, on-site
- Pets: Small pets welcome, €20/night supplement
- Cancellation: Free up to 48 hours before arrival
- Payment: Charged at check-out

═══════════════════════════════════════════════════════════════
LOCATION & NEARBY
═══════════════════════════════════════════════════════════════

- Cinque Terre: 20 min by car
- Portofino: 15 min by car
- Genoa (airport): 45 min by car
- Private beach: 2 min walk
- Train station: 10 min walk

═══════════════════════════════════════════════════════════════
CURRENT BOOKING STATE
═══════════════════════════════════════════════════════════════

${JSON.stringify(context.bookingState, null, 2)}

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
   
   NEVER call with confirm: true without Phase 1 first.
   NEVER call with confirm: true without explicit user confirmation.

4. Use context.bookingState to track progress. Don't re-ask for info already collected.

═══════════════════════════════════════════════════════════════
RESPONSE STYLE
═══════════════════════════════════════════════════════════════

- Warm and welcoming, but concise
- Use occasional Italian words for charm (Buongiorno, Perfetto, Grazie)
- Format prices clearly: €180/night, €360 total for 2 nights
- When listing rooms, include key differentiators
- When showing booking preview, be very clear about all details`;
}
```

### Main Chat Handler

```typescript
// application/use-cases/process-chat-message.use-case.ts

@Injectable()
export class ProcessChatMessageUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepo: IConversationRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepo: IRoomRepository,
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepo: IReservationRepository,
    private readonly openai: OpenAIAdapter,
  ) {}

  async execute(dto: ChatMessageDto): Promise<ChatResponseDto> {
    // 1. Load or create conversation with context
    let conversation = await this.conversationRepo.findBySessionId(dto.sessionId);
    if (!conversation) {
      conversation = await this.conversationRepo.create(dto.sessionId);
    }

    // 2. Build fresh context with current date and rooms from DB
    const context = await this.buildContext(conversation);
    
    // 3. Add user message to history
    context.recentMessages.push({
      role: 'user',
      content: dto.message,
      timestamp: new Date().toISOString()
    });

    // 4. Call OpenAI with function calling
    const response = await this.openai.chat({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: buildSystemPrompt(context) },
        ...this.formatMessagesForOpenAI(context.recentMessages)
      ],
      functions: functions,
      function_call: 'auto' // Let GPT decide
    });

    // 5. Process the function call
    const result = await this.processFunctionCall(
      response.choices[0].message,
      context
    );

    // 6. Save updated context
    await this.conversationRepo.updateContext(conversation.id, context);

    // 7. Add assistant response to history
    context.recentMessages.push({
      role: 'assistant', 
      content: result.message,
      timestamp: new Date().toISOString()
    });
    
    await this.conversationRepo.addMessage(conversation.id, {
      role: 'assistant',
      content: result.message,
      metadata: result.metadata
    });

    return {
      message: result.message,
      conversationId: conversation.id
    };
  }

  private async buildContext(conversation: Conversation): Promise<ConversationContext> {
    // ALWAYS fetch fresh room data from database
    const rooms = await this.roomRepo.findAllActive();
    
    return {
      conversationId: conversation.id,
      sessionId: conversation.sessionId,
      currentDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      availableRooms: rooms.map(r => ({
        slug: r.slug,
        name: r.name,
        description: r.description,
        pricePerNight: r.pricePerNight / 100, // cents to euros
        maxGuests: r.capacity,
        features: r.features,
        imageUrl: r.imageUrl
      })),
      bookingState: conversation.bookingState || {
        step: 'idle',
        checkIn: null,
        checkOut: null,
        guests: null,
        selectedRoom: null,
        guestName: null,
        guestEmail: null,
        availabilityResult: null,
        previewShown: false
      },
      recentMessages: conversation.messages?.slice(-20) || [] // Last 20 messages
    };
  }

  private async processFunctionCall(
    message: OpenAI.ChatCompletionMessage,
    context: ConversationContext
  ): Promise<{ message: string; metadata?: any }> {
    
    if (!message.function_call) {
      // Fallback - should not happen with proper setup
      return { message: message.content || "Mi scusi, I didn't understand. Could you rephrase?" };
    }

    const { name, arguments: argsJson } = message.function_call;
    const args = JSON.parse(argsJson);

    switch (name) {
      case 'respond':
        return { message: args.message };

      case 'check_availability':
        return await this.handleCheckAvailability(args, context);

      case 'create_reservation':
        return await this.handleCreateReservation(args, context);

      default:
        return { message: "Mi scusi, something went wrong. Please try again." };
    }
  }

  private async handleCheckAvailability(
    args: { checkIn: string; checkOut: string; guests?: number },
    context: ConversationContext
  ): Promise<{ message: string; metadata?: any }> {
    
    // Validate dates
    const checkIn = new Date(args.checkIn);
    const checkOut = new Date(args.checkOut);
    const today = new Date(context.currentDate);

    if (checkIn < today) {
      return { message: "The check-in date cannot be in the past. What dates would you like?" };
    }
    if (checkOut <= checkIn) {
      return { message: "Check-out must be after check-in. Could you please provide valid dates?" };
    }

    const guests = args.guests || 2;

    // Check availability in database
    const available = await this.roomRepo.findAvailable(checkIn, checkOut, guests);
    const allRooms = context.availableRooms;
    const availableSlugs = available.map(r => r.slug);
    const unavailable = allRooms.filter(r => !availableSlugs.includes(r.slug)).map(r => r.slug);

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Update context
    context.bookingState.step = 'checking_availability';
    context.bookingState.checkIn = args.checkIn;
    context.bookingState.checkOut = args.checkOut;
    context.bookingState.guests = guests;
    context.bookingState.availabilityResult = {
      checkIn: args.checkIn,
      checkOut: args.checkOut,
      nights,
      available: available.map(room => ({
        room: {
          slug: room.slug,
          name: room.name,
          description: room.description,
          pricePerNight: room.pricePerNight / 100,
          maxGuests: room.capacity,
          features: room.features,
          imageUrl: room.imageUrl
        },
        totalPrice: (room.pricePerNight / 100) * nights
      })),
      unavailable
    };

    // Format response for GPT to present
    // We need another GPT call to format this nicely, or format here
    if (available.length === 0) {
      return {
        message: `Mi dispiace, we don't have any rooms available for ${args.checkIn} to ${args.checkOut} (${nights} nights) for ${guests} guests. Would you like to try different dates?`
      };
    }

    const roomList = context.bookingState.availabilityResult.available
      .map(a => `• ${a.room.name}: €${a.room.pricePerNight}/night (€${a.totalPrice} total for ${nights} nights)`)
      .join('\n');

    return {
      message: `Perfetto! For ${args.checkIn} to ${args.checkOut} (${nights} nights, ${guests} guests), we have:\n\n${roomList}\n\nWhich room would you prefer?`,
      metadata: { availabilityResult: context.bookingState.availabilityResult }
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
    context: ConversationContext
  ): Promise<{ message: string; metadata?: any }> {

    // ═══════════════════════════════════════════════════════
    // VALIDATION - Don't trust GPT, verify everything
    // ═══════════════════════════════════════════════════════

    // Validate room exists
    const room = context.availableRooms.find(r => r.slug === args.roomSlug);
    if (!room) {
      return { message: `Mi scusi, I couldn't find that room. Available rooms are: ${context.availableRooms.map(r => r.name).join(', ')}` };
    }

    // Validate capacity
    if (args.guestsCount > room.maxGuests) {
      return { message: `${room.name} accommodates maximum ${room.maxGuests} guests. For ${args.guestsCount} guests, you might consider our Suite Portofino.` };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.guestEmail)) {
      return { message: "The email address doesn't look right. Could you please provide a valid email?" };
    }

    // Validate dates
    const checkIn = new Date(args.checkIn);
    const checkOut = new Date(args.checkOut);
    const today = new Date(context.currentDate);

    if (checkIn < today || checkOut <= checkIn) {
      return { message: "There seems to be an issue with the dates. Could you confirm your check-in and check-out dates?" };
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = room.pricePerNight * nights;

    // ═══════════════════════════════════════════════════════
    // PHASE 1: Preview (confirm: false)
    // ═══════════════════════════════════════════════════════

    if (!args.confirm) {
      // Update state
      context.bookingState.step = 'awaiting_confirmation';
      context.bookingState.selectedRoom = args.roomSlug;
      context.bookingState.guestName = args.guestName;
      context.bookingState.guestEmail = args.guestEmail;
      context.bookingState.guestsCount = args.guestsCount;
      context.bookingState.previewShown = true;

      return {
        message: `Ecco il riepilogo della prenotazione:\n
━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 ${room.name}
📅 ${args.checkIn} → ${args.checkOut} (${nights} nights)
👥 ${args.guestsCount} guest(s)
👤 ${args.guestName}
📧 ${args.guestEmail}
💰 Total: €${totalPrice}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Shall I confirm this reservation?`,
        metadata: { preview: true, totalPrice }
      };
    }

    // ═══════════════════════════════════════════════════════
    // PHASE 2: Create booking (confirm: true)
    // ═══════════════════════════════════════════════════════

    // CRITICAL: Verify preview was shown
    if (!context.bookingState.previewShown) {
      return { 
        message: "Let me first show you a summary of the booking before confirming.",
        metadata: { error: 'preview_not_shown' }
      };
    }

    // CRITICAL: Verify we're in correct state
    if (context.bookingState.step !== 'awaiting_confirmation') {
      return {
        message: "Something went wrong with the booking flow. Let's start over - what dates are you interested in?",
        metadata: { error: 'invalid_state' }
      };
    }

    // Create the reservation in database
    try {
      const reservation = await this.reservationRepo.create({
        roomId: room.slug, // Will need to map to actual ID
        checkIn: new Date(args.checkIn),
        checkOut: new Date(args.checkOut),
        guestName: args.guestName,
        guestEmail: args.guestEmail,
        guestsCount: args.guestsCount,
        totalPrice: totalPrice * 100, // euros to cents
        status: 'PENDING',
        conversationId: context.conversationId
      });

      // Update state
      context.bookingState.step = 'confirmed';

      return {
        message: `Perfetto! Your reservation is confirmed! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Reservation #${reservation.id.slice(0, 8).toUpperCase()}
📍 ${room.name}  
📅 ${args.checkIn} → ${args.checkOut}
💰 €${totalPrice}
━━━━━━━━━━━━━━━━━━━━━━━━━━━

A confirmation email will be sent to ${args.guestEmail}.

We look forward to welcoming you to Villa Limone! 🍋`,
        metadata: { 
          reservationId: reservation.id,
          confirmed: true 
        }
      };

    } catch (error) {
      return {
        message: "Mi dispiace, there was an error creating your reservation. Please try again or contact us directly at reservations@villalimone.com",
        metadata: { error: error.message }
      };
    }
  }
}
```

### OpenAI Adapter

```typescript
// infrastructure/ai/openai.adapter.ts

@Injectable()
export class OpenAIAdapter {
  private client: OpenAI;

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY')
    });
  }

  async chat(params: {
    model: string;
    messages: ChatCompletionMessageParam[];
    functions: ChatCompletionFunction[];
    function_call: 'auto' | 'none' | { name: string };
  }): Promise<ChatCompletion> {
    return await this.client.chat.completions.create({
      model: params.model,
      messages: params.messages,
      functions: params.functions,
      function_call: params.function_call,
      temperature: 0.7,
      max_tokens: 1000
    });
  }
}
```

---

## Checklist Before Implementation

- [ ] Conversation table has `context` JSONB column for storing ConversationContext
- [ ] Room repository has `findAllActive()` and `findAvailable(checkIn, checkOut, guests)` methods
- [ ] Reservation repository has `create()` method
- [ ] OpenAI API key is in environment variables
- [ ] All money values: stored in cents in DB, converted to euros for display

## Checklist After Implementation

- [ ] Test: Ask about rooms → should list rooms from database
- [ ] Test: Vague dates ("next month") → should ask for specific dates
- [ ] Test: Specific dates → should call check_availability
- [ ] Test: Select room → should ask for name and email
- [ ] Test: Provide all info → should show preview with confirm: false
- [ ] Test: Say "yes" → should create booking with confirm: true
- [ ] Test: Say "change the room" after preview → should NOT create booking
- [ ] Test: Price calculation matches database values
- [ ] Test: Past dates → should reject
- [ ] Test: More guests than room capacity → should suggest alternatives
