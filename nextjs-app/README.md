# TapMenu Armenia — SaaS NFC Menu Platform v2.0

## Overview
TapMenu Armenia — SaaS платформа цифровых NFC-меню для ресторанов. Одно касание NFC-тега — и гость видит полное меню на своём телефоне. Никаких приложений, никаких QR-сканеров.

## Architecture

```
app.tapmenu.am    — Owner Dashboard (Next.js 14)
menu.tapmenu.am   — Public Menu SSR (ISR 60s)
admin.tapmenu.am  — Super Admin Panel
tapmenu.am        — Landing Page (HTML/CSS/JS)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| DnD | @dnd-kit/core |
| Animation | Framer Motion |
| Database | Supabase PostgreSQL + Prisma ORM |
| Auth | Supabase Auth + JWT |
| Storage | Supabase Storage |
| Images | Sharp.js (WebP conversion, 3 sizes) |
| Translate | DeepL API (Pro+) / Google Translate (Starter) |
| AI | OpenAI GPT-4o + DALL-E 3 (LUXE only) |
| Email | Resend |
| Hosting | Vercel + Cron Jobs |
| Security | RLS, AES-256 WiFi, HTTPS, Rate limiting |

## Tariff Plans

| Plan | Price/mo | Menus | Dishes | Languages | Features |
|------|----------|-------|--------|-----------|----------|
| Starter | $15 | 1 | 30 | 2 | Basic menu, Google Translate |
| Pro | $25 | 3 | 100 | 5 | Analytics, multiple menus |
| Premium | $45 | 10 | 500 | 20 | DeepL, custom templates |
| LUXE | $50+ | ∞ | ∞ | 33 | AI assistant, DALL-E images |

All plans: 7-day free trial, 3-day grace period, 20% yearly discount

## Project Structure

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── (auth)/login/     # Auth pages
│   │   ├── dashboard/        # Owner dashboard
│   │   ├── admin/            # Super admin panel
│   │   ├── menu/[slug]/      # Public menu (SSR + ISR)
│   │   └── api/              # API routes
│   │       ├── auth/
│   │       ├── dishes/
│   │       ├── exchange-rates/
│   │       ├── upload/
│   │       ├── ai/chat/
│   │       └── cron/update-rates/
│   ├── components/
│   │   ├── ui/               # Button, Input, Card, Badge
│   │   ├── menu/             # PublicMenuClient
│   │   └── dashboard/
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client (anon + admin)
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── openai.ts         # GPT-4o + DALL-E 3
│   │   ├── translations.ts   # DeepL + Google Translate
│   │   ├── currency.ts       # CBA Armenia exchange rates
│   │   ├── image-processing.ts # Sharp.js WebP + 3 sizes
│   │   ├── security.ts       # AES-256, slug sanitizer, rate limit
│   │   └── utils.ts          # cn() helper
│   ├── stores/
│   │   ├── auth.ts           # Zustand auth store
│   │   └── menu.ts           # Menu preferences store
│   └── types/index.ts        # All TypeScript types + PLAN_LIMITS
├── prisma/schema.prisma       # Full Prisma schema (all tables)
├── supabase/migrations/       # SQL schema + RLS policies
├── vercel.json                # Cron jobs + function config
├── .env.local                 # Environment variables (DO NOT COMMIT)
└── .gitignore
```

## Setup & Development

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Fill in Supabase, OpenAI, DeepL, Resend keys
```

### 3. Setup database
```bash
# Apply Prisma schema
npx prisma db push

# Or run Supabase migration manually:
# Copy supabase/migrations/001_initial_schema.sql
# and run in Supabase SQL Editor
```

### 4. Generate Prisma client
```bash
npx prisma generate
```

### 5. Run development server
```bash
npm run dev
# → http://localhost:3000
```

## Demo Accounts (Development)
- Owner: `owner@demo.com` / `demo123`
- Admin: `admin@tapmenu.am` / `admin123`

## Key URLs (Local)
- Dashboard: http://localhost:3000/dashboard
- Admin Panel: http://localhost:3000/admin
- Public Menu: http://localhost:3000/menu/araratrest
- Login: http://localhost:3000/login

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | User login |
| GET | /api/dishes?restaurantId=xxx | Get dishes |
| POST | /api/dishes | Create dish |
| POST | /api/upload | Upload & process image (WebP) |
| GET | /api/exchange-rates | CBA Armenia rates |
| POST | /api/ai/chat | AI menu assistant (LUXE) |
| GET/POST | /api/cron/update-rates | Daily exchange rate update |

## Security
- Supabase Auth + JWT tokens
- RLS on all tables (owners see only their data)
- AES-256 encryption for WiFi passwords
- Slug sanitization (a-z, 0-9, hyphen only)
- Rate limiting on sensitive endpoints
- API keys in env vars only (never in code)

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY
vercel env add DEEPL_API_KEY
# ... etc
```

## 8-Week Roadmap

| Week | Focus |
|------|-------|
| 1 | ✅ Foundation: Next.js, DB schema, RLS, auth |
| 2 | Super admin panel |
| 3 | Owner dashboard core |
| 4 | Dish library (CRUD, Sharp, translations) |
| 5 | Public menu (SSR, templates, lang/currency switcher) |
| 6 | Integrations (CBA API, Cron, analytics, NFC/QR) |
| 7 | Landing & extras (WiFi, offers, lead form) |
| 8 | LUXE (V-template, AI assistant, testing, deploy) |

## Status
- ✅ Next.js 14 project initialized with TypeScript + Tailwind
- ✅ Full Prisma schema (all tables + relations)
- ✅ Supabase SQL migration with RLS policies
- ✅ Core UI components (Button, Input, Card, Badge)
- ✅ Dashboard layout + overview + dishes + analytics pages
- ✅ Admin panel layout + overview page
- ✅ Public menu page (SSR + ISR + language/currency switcher)
- ✅ Auth page (login with form validation)
- ✅ Key API routes (login, dishes, upload, exchange rates, AI, cron)
- ✅ Zustand stores (auth, menu preferences)
- ✅ Security utilities (AES-256, slug sanitizer, rate limiting)
- ✅ Image processing with Sharp.js (WebP, 3 sizes)
- ✅ DeepL + Google Translate integration
- ✅ OpenAI GPT-4o + DALL-E 3 integration
- ✅ Vercel cron job configuration
- ⏳ Full CRUD for dishes (modal form, drag-n-drop sort)
- ⏳ Menu builder with categories
- ⏳ NFC/QR code generator for tables
- ⏳ Restaurant settings page
- ⏳ LUXE AI assistant chat widget
- ⏳ CI/CD pipeline
