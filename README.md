# Villa Limone

Boutique Italian hotel landing page with AI concierge chatbot.

## Project Structure

```
villa-limone/
├── frontend/          # Next.js 14+ (App Router)
├── backend/           # NestJS + Prisma
└── docs/              # PRD and documentation
```

## Phase 0: Setup Complete ✅

### Frontend Setup
- ✅ Next.js 14+ with TypeScript
- ✅ Tailwind CSS configured with design system
- ✅ shadcn/ui initialized
- ✅ Basic app structure created
- ✅ API client configured

### Backend Setup
- ✅ NestJS with TypeScript
- ✅ Prisma ORM configured
- ✅ Database schema defined (Supabase/PostgreSQL with pgvector)
- ✅ Seed script created
- ✅ Basic app structure created

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- OpenAI API key (for AI features)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and API keys
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run migrations:
```bash
npm run prisma:migrate
```

6. Seed the database:
```bash
npm run prisma:seed
```

7. Start the development server:
```bash
npm run start:dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local if needed (default points to localhost:3001)
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Default Admin Credentials

After seeding:
- Email: `admin@villalimone.com`
- Password: `admin123`

⚠️ **Change these in production!**

## Next Steps

See `docs/PRD.md` for the complete development roadmap. Phase 0 is complete. Ready to proceed with Phase 1: Landing Page - Static.
