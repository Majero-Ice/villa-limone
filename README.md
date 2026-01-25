# 🍋 Villa Limone — Hotel Landing Page with AI Concierge

A modern landing page for a boutique Italian hotel featuring an AI-powered chatbot concierge. Visitors can explore rooms, amenities, and make reservations through natural conversation with the AI assistant.

<p align="center">
  <a href="#demo">View Demo</a> •
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a>
</p>

<!-- TODO: Replace with your deployed URL -->
<p align="center">
  <a href="https://villa-limone.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

---

## Demo

<!-- TODO: Replace with actual GIF/video (15-30 sec, showing: landing → chat → booking) -->
<p align="center">
  <a href="#">
    <img src="docs/assets/screenshots/preview.jpg" alt="Watch Demo" width="800" />
  </a>
</p>

---

## Features

### 🏨 Landing Page
- **Hero Section** — Stunning Mediterranean imagery with clear CTAs
- **Room Showcase** — Browse room types with photos, amenities, and pricing
- **Amenities Grid** — Visual overview of hotel services and facilities
- **Location Info** — Interactive section with nearby attractions
- **Testimonials** — Guest reviews with ratings
- **Responsive Design** — Optimized for mobile, tablet, and desktop

### 🤖 AI Concierge Chatbot
- **Natural Conversation** — Ask questions in plain language
- **RAG-Powered Answers** — Responses based on hotel knowledge base
- **Availability Check** — Real-time room availability for specific dates
- **Reservation Flow** — Complete booking through conversation
- **Two-Phase Booking** — Preview confirmation before finalizing
- **Multi-language** — Understands questions in multiple languages

### 🔐 Admin Panel
- **Dashboard** — Reservations overview and statistics
- **Reservation Management** — View, confirm, cancel bookings
- **Knowledge Base** — Upload documents, manage AI knowledge
- **Chat History** — Review all guest conversations
- **Bot Settings** — Customize system prompt and features
- **Auto-Crawl** — Scheduled website content updates

---

## Screenshots

<!-- TODO: Add actual screenshots -->

<details>
<summary>📸 Click to view screenshots</summary>

### Landing Page — Hero
<img src="docs/assets/screenshots/hero.jpg" alt="Hero Section" width="800" />

### Rooms Section
<img src="docs/assets/screenshots/rooms.png" alt="Rooms Section" width="800" />

### AI Chatbot
<img src="docs/assets/screenshots/chat.png" alt="AI Chatbot" width="800" />

### Amentities Section
<img src="docs/assets/screenshots/amentities.png" alt="Amentities Section" width="800" />

### Location Section
<img src="docs/assets/screenshots/location.png" alt="Location Section" width="800" />

### Admin Dashboard
<img src="docs/assets/screenshots/admin-dashpoard.png" alt="Admin Dashboard" width="800" />

### Admin Reservations
<img src="docs/assets/screenshots/admin-reservations.png" alt="Admin Reservations" width="800" />

### Admin Reservation Details
<img src="docs/assets/screenshots/admin-reservation-details.png" alt="Admin Reservation Details" width="800" />

### Knowledge Base Management
<img src="docs/assets/screenshots/admin-knowladge.png" alt="Knowledge Base" width="800" />

### Admin Chat List
<img src="docs/assets/screenshots/admin-chat-list.png" alt="Admin Chat List" width="800" />

### Admin Chat
<img src="docs/assets/screenshots/admin-chat.png" alt="Admin Chat" width="800" />


</details>

---

## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
</p>

### Frontend

| Category | Technology |
|----------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Architecture | Feature-Sliced Design (FSD) |
| State Management | Zustand |
| HTTP Client | Axios |
| Deployment | Vercel |

### Backend

| Category | Technology |
|----------|------------|
| Framework | NestJS |
| Language | TypeScript |
| Architecture | DDD + Clean Architecture |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7 |
| Vector Store | pgvector (Supabase) |
| AI | OpenAI GPT-4 + Embeddings |
| Deployment | Render |

---

## Architecture

### Frontend — Feature-Sliced Design (FSD)

```
frontend/src/
├── app/              # Next.js pages & layouts
├── widgets/          # Composite UI (sections, chat widget, admin panels)
├── features/         # User actions (send message, make reservation)
├── entities/         # Business objects (room, message, reservation)
└── shared/           # Reusable (ui, lib, config)
```

### Backend — DDD + Clean Architecture

```
backend/src/
├── modules/
│   ├── room/
│   │   ├── domain/           # Entities, Value Objects, Interfaces
│   │   ├── application/      # Use Cases, DTOs, Mappers
│   │   ├── infrastructure/   # Prisma Repository, External APIs
│   │   └── presentation/     # Controllers
│   ├── reservation/
│   ├── chat/
│   ├── knowledge-base/
│   └── admin/
└── shared/                   # Common utilities, Prisma, Guards
```

---

## AI Chatbot — How It Works

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  User Query  │────▶│ OpenAI Embedding │────▶│ Vector Search    │
│              │     │                  │     │ (pgvector)       │
└──────────────┘     └─────────────────┘     └────────┬─────────┘
                                                       │
                     ┌─────────────────┐               │ Top 5 chunks
                     │  GPT-4 + Tools  │◀──────────────┘
                     │                 │
                     │  Functions:     │
                     │  • respond      │
                     │  • check_avail  │
                     │  • create_res   │
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  AI Response    │
                     └─────────────────┘
```

### Function Calling

The chatbot uses OpenAI Function Calling (Tools API) with three functions:

| Function | Purpose |
|----------|---------|
| `respond` | General conversation, answering questions |
| `check_availability` | Query room availability for dates |
| `create_reservation` | Two-phase booking (preview → confirm) |

### Two-Phase Booking

1. **Phase 1** — `confirm: false` → Returns preview, no booking created
2. **Phase 2** — `confirm: true` → Only after explicit user confirmation

---

# 🛠️ Technical Documentation

<details>
<summary><strong>Click to expand setup instructions</strong></summary>

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database (Supabase recommended)
- OpenAI API key
- Supabase project with pgvector enabled

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/villa-limone.git
cd villa-limone
```

2. Install dependencies:

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Set up environment variables:

**Frontend (`frontend/.env.local`):**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**Backend (`backend/.env`):**

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# OpenAI
OPENAI_API_KEY="sk-..."

# Auth
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

4. Set up the database:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. Seed the database:

```bash
npm run seed              # Rooms, amenities, testimonials
npm run seed:knowledge    # AI knowledge base
npm run seed:admin        # Admin user
```

6. Run development servers:

```bash
# Terminal 1 — Backend
cd backend
npm run start:dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)

---

## Admin Panel

Access: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

**Default Credentials:**
- Email: `admin@villalimone.com`
- Password: `admin123`

**Capabilities:**
- Dashboard with reservation statistics
- Manage reservations (confirm, cancel, delete)
- Upload documents to knowledge base
- View chat history
- Configure chatbot settings
- Trigger manual website crawl

---

## Development Phases

- [x] Phase 0: Project Setup
- [x] Phase 1: Static Landing Page
- [x] Phase 2: Backend Hotel Data
- [x] Phase 3: Chat UI
- [x] Phase 4: AI Integration (RAG)
- [x] Phase 5: Availability & Booking
- [x] Phase 6: Admin Auth & Layout
- [x] Phase 7: Admin Reservations
- [x] Phase 8: Knowledge Base Management
- [x] Phase 9: Chat History & Settings
- [x] Phase 10: Polish & Deploy

</details>

---

## License

ISC

---

<p align="center">
  Built with ☕ by <a href="https://github.com/Majero-Ice">Majero</a>
</p>
