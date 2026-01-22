# Villa Limone — Complete PRD

## Overview

Landing page for a boutique Italian hotel (Ligurian coast) with AI concierge chatbot. Visitors explore rooms and amenities, chat with AI to ask questions and make reservations. Admin panel for managing bookings and chatbot knowledge base.

**Purpose:** Portfolio project — full-stack, AI integration, RAG, booking logic, content management.

---

## Tech Stack

### Frontend

- Next.js 14+ (App Router)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Zustand (state)
- Axios (HTTP)
- Lucide React (icons)
- Deploy: Vercel

### Backend

- NestJS
- TypeScript
- Prisma ORM
- Supabase (PostgreSQL + pgvector)
- OpenAI API (GPT-4 + Embeddings)
- node-cron (scheduling)
- Deploy: Railway / Render

---

## Design System

### Colors

```typescript
// tailwind.config.ts colors
colors: {
  ivory: "#FDFBF7",           // main background
  sand: "#F5EDE4",            // cards, sections
  terracotta: {
    DEFAULT: "#C67D5A",       // primary accent
    light: "#D4967A",
    dark: "#A86544",
  },
  olive: {
    DEFAULT: "#8B9A7D",       // secondary accent
    light: "#A3B094",
    dark: "#6E7D62",
  },
  graphite: "#2D2D2D",        // main text
  "warm-gray": "#6B635A",     // muted text
  "soft-beige": "#E5DDD3",    // borders
  
  // Admin
  slate: "#1E293B",           // admin sidebar
  
  // Semantic
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
}
```

### Typography

```typescript
fontFamily: {
  sans: ["Inter", "system-ui", "sans-serif"],
  serif: ["Playfair Display", "Georgia", "serif"],
}

// Headings: font-serif
// Body: font-sans
// H1: 56px/700, H2: 40px/600, H3: 28px/600, Body: 16-18px/400
```

### Spacing & Radius

- Section padding: `py-20` (80px)
- Card radius: `rounded-xl` (12px)
- Button radius: `rounded-lg` (8px)
- Shadows: `shadow-soft`, `shadow-medium`, `shadow-lifted`

---

## Frontend Architecture — Feature-Sliced Design

### Layer Hierarchy

```
app → widgets → features → entities → shared
```

Dependencies point downward only. Never import from upper layers.

### Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Dashboard
│   │   ├── login/page.tsx
│   │   ├── reservations/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── knowledge/page.tsx
│   │   ├── chats/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── settings/page.tsx
│   └── globals.css
│
├── widgets/
│   ├── header/
│   ├── footer/
│   ├── hero-section/
│   ├── about-section/
│   ├── rooms-section/
│   ├── amenities-section/
│   ├── location-section/
│   ├── testimonials-section/
│   ├── chat-widget/
│   └── admin/
│       ├── admin-sidebar/
│       ├── admin-header/
│       ├── stats-cards/
│       ├── reservations-table/
│       ├── documents-table/
│       ├── conversations-table/
│       └── conversation-thread/
│
├── features/
│   ├── send-message/
│   ├── check-availability/
│   ├── make-reservation/
│   └── admin/
│       ├── upload-document/
│       ├── manage-reservation/
│       ├── trigger-crawl/
│       ├── edit-bot-settings/
│       └── admin-auth/
│
├── entities/
│   ├── room/
│   ├── amenity/
│   ├── testimonial/
│   ├── message/
│   ├── reservation/
│   ├── document/
│   └── conversation/
│
└── shared/
    ├── ui/           # button, card, input, modal, table, badge...
    ├── lib/          # api.ts, cn.ts, formatDate.ts, formatPrice.ts
    └── config/       # env.ts, constants.ts
```

### Slice Structure

```
entities/room/
├── ui/
│   ├── RoomCard.tsx
│   └── RoomDetails.tsx
├── model/
│   └── types.ts
├── api/
│   └── roomApi.ts
└── index.ts          # public exports
```

### Frontend Patterns

**API Client:**

```typescript
// shared/lib/api.ts
import axios from 'axios';
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// entities/room/api/roomApi.ts
export const roomApi = {
  getAll: () => api.get<Room[]>('/rooms').then(r => r.data),
  getBySlug: (slug: string) => api.get<Room>(`/rooms/${slug}`).then(r => r.data),
};
```

**Zustand Store:**

```typescript
// widgets/chat-widget/model/chat.store.ts
import { create } from 'zustand';

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  addMessage: (msg: Message) => void;
  setLoading: (loading: boolean) => void;
  toggle: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (loading) => set({ isLoading: loading }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
```

**Component:**

```typescript
// entities/room/ui/RoomCard.tsx
interface RoomCardProps {
  room: Room;
  onSelect?: (room: Room) => void;
}

export function RoomCard({ room, onSelect }: RoomCardProps) {
  return (
    <div className="card-elevated p-4">
      <img src={room.imageUrl} alt={room.name} className="rounded-lg" />
      <h3 className="font-serif text-h4 mt-4">{room.name}</h3>
      <p className="text-warm-gray">{room.capacity} guests</p>
      <p className="text-terracotta font-medium">€{room.pricePerNight}/night</p>
    </div>
  );
}
```

---

## Backend Architecture — DDD + Clean Architecture

### Layer Hierarchy

```
Presentation → Application → Domain ← Infrastructure
```

Domain has NO external dependencies. Infrastructure implements domain interfaces.

### Structure

```
src/
├── modules/
│   ├── room/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── room.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   └── price.vo.ts
│   │   │   ├── repositories/
│   │   │   │   └── room.repository.interface.ts
│   │   │   └── services/
│   │   │       └── room-availability.service.ts
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   │   ├── get-all-rooms.use-case.ts
│   │   │   │   ├── get-room-by-slug.use-case.ts
│   │   │   │   └── check-availability.use-case.ts
│   │   │   ├── dtos/
│   │   │   │   └── room.dto.ts
│   │   │   └── mappers/
│   │   │       └── room.mapper.ts
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   │   ├── room.prisma-repository.ts
│   │   │   │   └── room.prisma-mapper.ts
│   │   │   └── room.module.ts
│   │   └── presentation/
│   │       └── room.controller.ts
│   │
│   ├── reservation/
│   │   └── ... (same structure)
│   │
│   ├── chat/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   ├── ai/
│   │   │   │   ├── openai.adapter.ts
│   │   │   │   └── embedding.service.ts
│   │   │   └── vector-store/
│   │   │       └── supabase-vector.adapter.ts
│   │   └── presentation/
│   │
│   ├── knowledge-base/
│   │   ├── infrastructure/
│   │   │   ├── crawler/
│   │   │   │   └── website-crawler.service.ts
│   │   │   └── parsers/
│   │   │       ├── pdf.parser.ts
│   │   │       └── markdown.parser.ts
│   │   └── ...
│   │
│   └── admin/
│       └── ...
│
├── shared/
│   ├── domain/
│   │   ├── base.entity.ts
│   │   └── base.value-object.ts
│   ├── application/
│   │   └── base.use-case.ts
│   └── infrastructure/
│       ├── prisma/
│       │   ├── prisma.service.ts
│       │   └── prisma.module.ts
│       └── guards/
│           └── jwt-auth.guard.ts
│
├── app.module.ts
└── main.ts
```

### Backend Patterns

**Entity (Domain):**

```typescript
// domain/entities/room.entity.ts
import { Price } from '../value-objects/price.vo';

export interface RoomProps {
  id: string;
  slug: string;
  name: string;
  description: string;
  capacity: number;
  pricePerNight: Price;
  features: string[];
  isActive: boolean;
}

export class Room {
  private constructor(private readonly props: RoomProps) {}

  static create(props: RoomProps): Room {
    if (props.capacity < 1) {
      throw new Error('Room capacity must be at least 1');
    }
    return new Room(props);
  }

  get id(): string { return this.props.id; }
  get slug(): string { return this.props.slug; }
  get name(): string { return this.props.name; }
  get pricePerNight(): Price { return this.props.pricePerNight; }

  canAccommodate(guests: number): boolean {
    return guests <= this.props.capacity;
  }
}
```

**Value Object:**

```typescript
// domain/value-objects/price.vo.ts
export class Price {
  private constructor(private readonly cents: number) {}

  static fromCents(cents: number): Price {
    if (cents < 0) throw new Error('Price cannot be negative');
    return new Price(cents);
  }

  get inCents(): number { return this.cents; }
  get inEuros(): number { return this.cents / 100; }

  multiply(nights: number): Price {
    return Price.fromCents(this.cents * nights);
  }
}
```

**Repository Interface (Domain):**

```typescript
// domain/repositories/room.repository.interface.ts
import { Room } from '../entities/room.entity';

export interface IRoomRepository {
  findAll(): Promise<Room[]>;
  findBySlug(slug: string): Promise<Room | null>;
  findAvailable(checkIn: Date, checkOut: Date, guests: number): Promise<Room[]>;
}

export const ROOM_REPOSITORY = Symbol('IRoomRepository');
```

**Repository Implementation (Infrastructure):**

```typescript
// infrastructure/persistence/room.prisma-repository.ts
@Injectable()
export class RoomPrismaRepository implements IRoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Room[]> {
    const records = await this.prisma.room.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return records.map(RoomPrismaMapper.toDomain);
  }
}
```

**Use Case (Application):**

```typescript
// application/use-cases/get-all-rooms.use-case.ts
@Injectable()
export class GetAllRoomsUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(): Promise<RoomDto[]> {
    const rooms = await this.roomRepository.findAll();
    return rooms.map(RoomMapper.toDto);
  }
}
```

**Controller (Presentation):**

```typescript
// presentation/room.controller.ts
@Controller('api/rooms')
export class RoomController {
  constructor(
    private readonly getAllRooms: GetAllRoomsUseCase,
    private readonly getRoomBySlug: GetRoomBySlugUseCase,
    private readonly checkAvailability: CheckAvailabilityUseCase,
  ) {}

  @Get()
  findAll() {
    return this.getAllRooms.execute();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.getRoomBySlug.execute(slug);
  }

  @Post('availability')
  checkAvailability(@Body() dto: AvailabilityRequestDto) {
    return this.checkAvailability.execute(dto);
  }
}
```

**Module (Infrastructure):**

```typescript
// infrastructure/room.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [RoomController],
  providers: [
    { provide: ROOM_REPOSITORY, useClass: RoomPrismaRepository },
    GetAllRoomsUseCase,
    GetRoomBySlugUseCase,
    CheckAvailabilityUseCase,
  ],
  exports: [ROOM_REPOSITORY],
})
export class RoomModule {}
```

---

## Database Schema (Prisma)

```prisma
// ===================
// KNOWLEDGE BASE
// ===================

model Document {
  id          String   @id @default(uuid())
  name        String
  type        String   // "pdf", "txt", "md", "crawl"
  sourceUrl   String?
  content     String
  contentHash String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  chunks      Chunk[]
}

model Chunk {
  id         String   @id @default(uuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  content    String
  embedding  Unsupported("vector(1536)")?
  metadata   Json?
  createdAt  DateTime @default(now())
  @@index([documentId])
}

// ===================
// HOTEL
// ===================

model Room {
  id            String             @id @default(uuid())
  slug          String             @unique
  name          String
  description   String
  capacity      Int
  pricePerNight Int                // cents
  imageUrl      String
  features      String[]
  isActive      Boolean            @default(true)
  sortOrder     Int                @default(0)
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt
  reservations  Reservation[]
  availability  RoomAvailability[]
}

model RoomAvailability {
  id        String   @id @default(uuid())
  roomId    String
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  date      DateTime @db.Date
  isBlocked Boolean  @default(false)
  @@unique([roomId, date])
  @@index([roomId])
  @@index([date])
}

model Reservation {
  id              String            @id @default(uuid())
  roomId          String
  room            Room              @relation(fields: [roomId], references: [id])
  guestName       String
  guestEmail      String
  checkIn         DateTime          @db.Date
  checkOut        DateTime          @db.Date
  guestsCount     Int
  totalPrice      Int               // cents
  status          ReservationStatus @default(PENDING)
  specialRequests String?
  conversationId  String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  @@index([roomId])
  @@index([guestEmail])
  @@index([status])
  @@index([createdAt])
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

model Testimonial {
  id        String   @id @default(uuid())
  guestName String
  content   String
  rating    Int
  date      DateTime
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Amenity {
  id          String  @id @default(uuid())
  name        String
  description String?
  icon        String
  category    String  // "general", "wellness", "dining", "services"
  sortOrder   Int     @default(0)
  isActive    Boolean @default(true)
}

// ===================
// CHAT
// ===================

model Conversation {
  id             String    @id @default(uuid())
  sessionId      String
  hasReservation Boolean   @default(false)
  messageCount   Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  messages       Message[]
  @@index([sessionId])
  @@index([createdAt])
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           MessageRole
  content        String
  metadata       Json?
  createdAt      DateTime     @default(now())
  @@index([conversationId])
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

// ===================
// ADMIN & SETTINGS
// ===================

model Admin {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model BotSettings {
  id                    String   @id @default("default")
  systemPrompt          String   @db.Text
  enableBooking         Boolean  @default(true)
  enableRecommendations Boolean  @default(true)
  enableAvailability    Boolean  @default(true)
  updatedAt             DateTime @updatedAt
}

model QuickReply {
  id        String   @id @default(uuid())
  trigger   String
  response  String   @db.Text
  isActive  Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
}

model CrawlLog {
  id               String      @id @default(uuid())
  status           CrawlStatus
  sourceUrl        String
  documentsUpdated Int         @default(0)
  chunksCreated    Int         @default(0)
  error            String?
  startedAt        DateTime    @default(now())
  completedAt      DateTime?
}

enum CrawlStatus {
  RUNNING
  COMPLETED
  FAILED
}

model CrawlSchedule {
  id        String    @id @default("default")
  enabled   Boolean   @default(false)
  frequency String    @default("daily")
  lastRun   DateTime?
  nextRun   DateTime?
  sourceUrl String
  updatedAt DateTime  @updatedAt
}
```

---

## API Endpoints

### Public


| Method | Route                     | Description                 |
| -------- | --------------------------- | ----------------------------- |
| GET    | `/api/rooms`              | All active rooms            |
| GET    | `/api/rooms/:slug`        | Single room                 |
| POST   | `/api/rooms/availability` | Check availability          |
| GET    | `/api/amenities`          | All amenities               |
| GET    | `/api/testimonials`       | Active testimonials         |
| POST   | `/api/chat/message`       | Send message → AI response |
| POST   | `/api/reservations`       | Create reservation          |

### Admin (JWT Protected)


| Method | Route                          | Description         |
| -------- | -------------------------------- | --------------------- |
| POST   | `/api/admin/auth/login`        | Login → JWT        |
| GET    | `/api/admin/auth/me`           | Current admin       |
| GET    | `/api/admin/dashboard/stats`   | Dashboard stats     |
| GET    | `/api/admin/reservations`      | List (filterable)   |
| GET    | `/api/admin/reservations/:id`  | Detail              |
| PATCH  | `/api/admin/reservations/:id`  | Update status       |
| DELETE | `/api/admin/reservations/:id`  | Delete              |
| GET    | `/api/admin/documents`         | List documents      |
| POST   | `/api/admin/documents`         | Upload document     |
| DELETE | `/api/admin/documents/:id`     | Delete document     |
| POST   | `/api/admin/crawl`             | Trigger crawl       |
| GET    | `/api/admin/crawl/schedule`    | Get schedule        |
| PATCH  | `/api/admin/crawl/schedule`    | Update schedule     |
| GET    | `/api/admin/conversations`     | List conversations  |
| GET    | `/api/admin/conversations/:id` | Conversation detail |
| GET    | `/api/admin/settings`          | Bot settings        |
| PATCH  | `/api/admin/settings`          | Update settings     |
| GET    | `/api/admin/quick-replies`     | List                |
| POST   | `/api/admin/quick-replies`     | Create              |
| PATCH  | `/api/admin/quick-replies/:id` | Update              |
| DELETE | `/api/admin/quick-replies/:id` | Delete              |

---

## User Stories

### Visitor (Landing)

1. See hero with hotel imagery
2. Read about hotel story
3. Browse rooms with photos, prices
4. See amenities
5. Learn about location
6. Read testimonials
7. Find contact info

### Visitor (Chatbot)

8. Open chat via floating button
9. Ask questions → AI answers
10. Check room availability
11. Make reservation through chat
12. Get local recommendations
13. Session persistence

### Admin — Dashboard

14. Login to admin panel
15. See stats: reservations, revenue
16. See recent activity

### Admin — Reservations

17. View all reservations (filterable)
18. View details
19. Confirm / cancel
20. Delete

### Admin — Knowledge Base

21. View documents list
22. Upload new (PDF, TXT, MD)
23. Delete documents
24. Manual re-crawl
25. Configure auto-crawl schedule

### Admin — Chats & Settings

26. View conversations
27. View message history
28. Edit system prompt
29. Toggle bot features
30. Manage quick replies

---

## Seed Data

### Rooms


| Name            | Slug            | Capacity | €/Night | Features                                  |
| ----------------- | ----------------- | ---------- | ---------- | ------------------------------------------- |
| Camera Mare     | camera-mare     | 2        | 180      | Sea view, Balcony, King bed, AC, Mini bar |
| Camera Limone   | camera-limone   | 2        | 150      | Garden view, Queen bed, Terrace, AC       |
| Suite Portofino | suite-portofino | 4        | 280      | Panoramic view, Living area, 2BR, Jacuzzi |
| Camera Giardino | camera-giardino | 2        | 130      | Courtyard view, Queen bed, Quiet, Desk    |

### Amenities

**General:** Free WiFi, AC, Daily housekeeping, Concierge, Luggage storage
**Wellness:** Garden terrace, Beach access, Yoga mats, Sun loungers
**Dining:** Breakfast included, Restaurant, Room service, Wine cellar
**Services:** Airport transfer, Free parking, Laundry, Tour booking

### Testimonials

- "Most beautiful views..." — Maria S., ★★★★★
- "Staff made us feel like family..." — James & Linda, ★★★★★
- "Perfect location..." — Thomas K., ★★★★☆
- "Homemade breakfast incredible..." — Sophie M., ★★★★★

### Default System Prompt

```
You are the AI concierge for Villa Limone, a boutique hotel on the Ligurian coast.
Be warm and helpful, reflecting Italian hospitality. Keep responses concise.

You can:
- Answer questions about hotel, rooms, amenities, policies
- Check room availability (ask for dates and guests)
- Help make reservations (collect: name, email, dates, room, guest count)
- Recommend local restaurants and activities

Hotel info:
- Check-in: 3 PM, Check-out: 11 AM
- Breakfast: 7:30-10:30 AM
- Parking: Free, on-site
- Pets: Small pets welcome, €20/night
- Nearby: Cinque Terre (20 min), Portofino (15 min), Genoa (45 min)
- Beach: Private, 2 min walk

If unsure, offer to have front desk follow up.
```

---

## Development Phases

### Phase 0: Setup (2h)

- [X] Create monorepo structure (frontend/ + backend/)
- [X] Frontend: Next.js + TypeScript + Tailwind + shadcn/ui
- [X] Setup tailwind.config.ts with design system colors
- [X] Setup globals.css with CSS variables
- [X] Backend: NestJS + TypeScript + Prisma
- [X] Configure Prisma with Supabase
- [X] Run migrations
- [X] Create seed data (rooms, amenities, testimonials, admin)
- [X] Setup environment variables both sides
- [X] Test connection frontend → backend

### Phase 1: Landing Page — Static (3-4h)

- [X] Setup fonts (Playfair Display, Inter)
- [X] Create layout (Header, Footer)
- [X] Build HeroSection (full viewport, image, CTAs)
- [X] Build AboutSection (two columns)
- [X] Build RoomsSection with RoomCard (mock data)
- [X] Build AmenitiesSection (icon grid)
- [X] Build LocationSection (map + text)
- [X] Build TestimonialsSection
- [X] Smooth scroll navigation
- [X] Mobile responsive

### Phase 2: Landing Page — Dynamic (2h)

- [X] Backend: GET /api/rooms endpoint (use case, repo, controller)
- [X] Backend: GET /api/amenities endpoint
- [X] Backend: GET /api/testimonials endpoint
- [X] Frontend: Create API functions in entities
- [X] Connect RoomsSection to real data
- [X] Connect AmenitiesSection to real data
- [X] Connect TestimonialsSection to real data
- [X] Add loading skeletons

### Phase 3: Chat UI (2-3h)

- [X] Build ChatWidget (floating button, terracotta)
- [X] Build ChatWindow (400px, expandable)
- [X] Build ChatMessage (user right, assistant left)
- [X] Build ChatInput (input + send button)
- [X] Create chat.store.ts (Zustand)
- [X] Open/close animation
- [X] Typing indicator
- [X] Session ID generation + persistence
- [X] Mobile responsive chat

### Phase 4: AI Integration (2-3h)

- [X] Prepare knowledge base content (markdown files)
- [X] Backend: Document/Chunk models already exist
- [X] Import hotel info → chunks → embeddings
- [X] Backend: POST /api/chat/message endpoint
- [X] Implement RAG: query → embeddings → similar chunks → GPT
- [X] Connect chat UI to backend
- [X] Test Q&A (hotel info, room details)
- [X] Fine-tune system prompt

### Phase 5: Availability & Booking (3h)

- [X] Backend: POST /api/rooms/availability (check dates)
- [X] Backend: POST /api/reservations (create)
- [X] Add intent detection to chat (availability, booking)
- [X] Implement availability check in conversation
- [X] Implement booking flow (collect name, email, dates, room)
- [X] Create reservation record linked to conversation
- [X] Update conversation.hasReservation flag
- [X] Test full flow: ask → check → book

### Phase 6: Admin — Auth & Layout (2h)

- [X] Backend: Admin model + seed default admin
- [X] Backend: POST /api/admin/auth/login (JWT)
- [X] Backend: GET /api/admin/auth/me
- [X] Backend: JwtAuthGuard for admin routes
- [X] Frontend: AdminSidebar (dark theme)
- [X] Frontend: AdminHeader
- [X] Frontend: Admin layout.tsx
- [X] Frontend: Login page + form
- [X] Frontend: auth.store.ts (token management)
- [X] Route protection (redirect if not logged in)

### Phase 7: Admin — Dashboard & Reservations (3h)

- [X] Backend: GET /api/admin/dashboard/stats
- [X] Frontend: StatsCards component
- [X] Frontend: Dashboard page
- [X] Backend: GET /api/admin/reservations (filters, pagination)
- [X] Backend: GET /api/admin/reservations/:id
- [X] Backend: PATCH /api/admin/reservations/:id (status)
- [X] Backend: DELETE /api/admin/reservations/:id
- [X] Frontend: ReservationsTable + StatusBadge
- [X] Frontend: Reservations list page
- [X] Frontend: Reservation detail page
- [X] Confirm/cancel actions
- [X] Delete with confirmation modal

### Phase 8: Admin — Knowledge Base (3h)

- [X] Backend: GET /api/admin/documents
- [X] Backend: POST /api/admin/documents (upload + parse + chunk + embed)
- [X] Backend: DELETE /api/admin/documents/:id
- [X] Backend: POST /api/admin/crawl (manual trigger)
- [X] Backend: GET/PATCH /api/admin/crawl/schedule
- [X] Backend: node-cron job for auto-crawl
- [X] Frontend: DocumentsTable
- [X] Frontend: Upload form (file picker)
- [X] Frontend: Knowledge page
- [X] Frontend: Crawl button + status display
- [X] Frontend: Schedule settings

### Phase 9: Admin — Chats & Settings (2h)

- [X] Backend: GET /api/admin/conversations (paginated)
- [X] Backend: GET /api/admin/conversations/:id (with messages)
- [X] Backend: GET/PATCH /api/admin/settings
- [X] Backend: CRUD /api/admin/quick-replies
- [X] Frontend: ConversationsTable
- [X] Frontend: ConversationThread
- [X] Frontend: Chats list + detail pages
- [X] Frontend: Settings page (system prompt, toggles)
- [X] Frontend: Quick replies management

### Phase 10: Polish & Deploy (2-3h)

- [ ] Add loading states everywhere
- [ ] Add error handling (toasts, error states)
- [ ] Final responsive testing
- [ ] Image optimization (next/image)
- [ ] SEO meta tags
- [ ] Lighthouse audit (target >80)
- [ ] Deploy backend to Railway/Render
- [ ] Deploy frontend to Vercel
- [ ] Configure CORS, env vars
- [ ] Test production flow

---

## Acceptance Criteria

### Landing

- [ ] All sections render correctly
- [ ] Mobile responsive
- [ ] Smooth scroll works
- [ ] Chat widget visible from any position

### Chatbot

- [ ] Opens/closes smoothly
- [ ] AI answers hotel questions correctly
- [ ] Availability check works
- [ ] Full booking flow works
- [ ] Session persists on page refresh

### Admin

- [ ] Login works
- [ ] Dashboard stats accurate
- [ ] Reservations CRUD works
- [ ] Document upload/delete works
- [ ] Crawl trigger works
- [ ] Chat history viewable
- [ ] Settings changes apply

### Technical

- [ ] Lighthouse >80
- [ ] No console errors
- [ ] Errors handled gracefully

---

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

---

## File Naming Conventions

### Frontend

- Components: `PascalCase.tsx`
- Hooks: `use-*.ts`
- Stores: `*.store.ts`
- API: `*Api.ts`
- Types: `types.ts`

### Backend

- Entities: `*.entity.ts`
- Value Objects: `*.vo.ts`
- Repositories: `*.repository.interface.ts` / `*.prisma-repository.ts`
- Use Cases: `*.use-case.ts`
- DTOs: `*.dto.ts`
- Controllers: `*.controller.ts`
- Modules: `*.module.ts`

---

## Don'ts

### Frontend

- Don't put logic in app/ pages — use widgets/features
- Don't import upper FSD layers
- Don't hardcode colors — use Tailwind config
- Don't skip loading states

### Backend

- Don't import Prisma in domain layer
- Don't put business logic in controllers
- Don't skip use case layer
- Don't expose Prisma types outside infrastructure
