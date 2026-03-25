# TapMenu Armenia — CURRENT STATE (as-is)

> Generated: 2026-03-24 | PHASE 00 — Foundation Audit
> Revision: 1.0

---

## 1. Project Overview

TapMenu Armenia is a SaaS platform for Armenian restaurants providing NFC/QR digital menus with multi-language support, analytics, AI dish translation, and a web-cabinet for restaurant owners.

**Repository:** https://github.com/radarbinyan-design/Taptomenu
**Primary domain:** https://tapmenu.am (landing), https://app.tapmenu.am (Next.js app)

---

## 2. Repository Layout

```
/home/user/webapp/
├── .git/
├── .gitignore
├── README.md
├── MVP_BRIEFING_FOR_SUPERAGENT.md
├── manifest.json                    # PWA manifest (static landing)
├── sw.js                            # Service worker (static landing)
│
├── *.html                           # 13 static HTML pages (landing site)
│   ├── index.html                   # Main landing page
│   ├── pricing.html
│   ├── how-it-works.html
│   ├── contact.html
│   ├── luxe.html                    # LUXE tier promo
│   ├── app.html
│   ├── login.html                   # Legacy static login (superseded by Next.js)
│   ├── menu.html                    # Legacy static menu demo
│   ├── analytics.html               # Legacy static analytics demo
│   ├── settings.html                # Legacy static settings
│   ├── waiter.html                  # Legacy static waiter view
│   ├── competitor_analysis.html
│   └── TapMenu_Armenia_TZ.html      # Technical specification (Russian)
│
├── css/
│   ├── main.css                     # Landing styles
│   ├── dashboard.css                # Legacy dashboard styles
│   └── luxe.css                     # LUXE page styles
│
├── js/
│   ├── main.js                      # Landing scripts
│   ├── dashboard.js                 # Legacy dashboard scripts
│   └── supabase-config.js           # Legacy Supabase browser config
│
├── demo/                            # Demo assets
│
└── nextjs-app/                      # ★ PRIMARY APPLICATION ★
    ├── package.json
    ├── next.config.mjs
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── vercel.json                  # Crons, regions, function config
    ├── ecosystem.config.js          # PM2 config
    ├── .eslintrc.json
    │
    ├── prisma/
    │   └── schema.prisma            # 13 models, 5 enums
    │
    ├── supabase/
    │   ├── README.md
    │   └── migrations/
    │       ├── 001_initial_schema.sql    # Full schema v1
    │       ├── 0001_initial_schema.sql   # Duplicate (needs cleanup)
    │       └── 0002_leads_table.sql      # Leads table + RLS
    │
    ├── docs/                        # ← NEW (Phase 00)
    ├── scripts/                     # ← NEW (Phase 00)
    ├── tests/                       # ← NEW (Phase 00)
    │
    └── src/
        ├── middleware.ts
        ├── app/
        │   ├── globals.css
        │   ├── layout.tsx           # Root layout (Inter font, metadata)
        │   ├── page.tsx             # Landing page (Next.js version)
        │   │
        │   ├── (auth)/
        │   │   ├── layout.tsx
        │   │   ├── login/page.tsx
        │   │   ├── register/page.tsx
        │   │   └── forgot-password/page.tsx
        │   │
        │   ├── admin/
        │   │   ├── layout.tsx
        │   │   ├── page.tsx              # Super-admin dashboard
        │   │   ├── analytics/page.tsx
        │   │   ├── leads/page.tsx
        │   │   ├── restaurants/page.tsx
        │   │   ├── revenue/page.tsx
        │   │   ├── settings/page.tsx
        │   │   ├── subscriptions/page.tsx
        │   │   └── users/page.tsx
        │   │
        │   ├── dashboard/
        │   │   ├── layout.tsx            # Sidebar + topbar shell
        │   │   ├── page.tsx              # KPI overview
        │   │   ├── ai-assistant/page.tsx
        │   │   ├── analytics/page.tsx
        │   │   ├── dishes/
        │   │   │   ├── page.tsx          # Dish library
        │   │   │   ├── new/page.tsx      # Add dish form
        │   │   │   └── [id]/page.tsx     # Edit dish
        │   │   ├── menus/
        │   │   │   ├── page.tsx          # Menu list
        │   │   │   └── [id]/edit/page.tsx
        │   │   ├── settings/page.tsx
        │   │   └── tables/page.tsx
        │   │
        │   ├── menu/
        │   │   └── [slug]/
        │   │       ├── page.tsx          # Public menu SSR (ISR 60s)
        │   │       └── PublicMenuClient.tsx  # Client-side menu UI
        │   │
        │   ├── api/
        │   │   ├── ai/chat/route.ts
        │   │   ├── auth/login/route.ts
        │   │   ├── auth/logout/route.ts
        │   │   ├── dishes/route.ts       # GET (list) + POST (create)
        │   │   ├── exchange-rates/route.ts
        │   │   ├── leads/route.ts        # GET + POST + PATCH
        │   │   └── upload/route.ts       # Image upload (Supabase storage)
        │   │
        │   ├── contact/page.tsx
        │   ├── how-it-works/page.tsx
        │   ├── pricing/page.tsx
        │   └── dev/page.tsx              # Dev shortcuts (blocked in prod)
        │
        ├── components/
        │   ├── landing/                  # 10 landing section components
        │   │   ├── LandingHeader.tsx
        │   │   ├── HeroSection.tsx
        │   │   ├── StatsSection.tsx
        │   │   ├── FeaturesSection.tsx
        │   │   ├── HowItWorksSection.tsx
        │   │   ├── PricingSection.tsx
        │   │   ├── FAQSection.tsx
        │   │   ├── ContactSection.tsx
        │   │   ├── CTASection.tsx
        │   │   └── LandingFooter.tsx
        │   │
        │   └── ui/                       # 6 base UI primitives
        │       ├── badge.tsx
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── input.tsx
        │       ├── select.tsx
        │       └── textarea.tsx
        │
        ├── lib/
        │   ├── utils.ts                  # cn() helper
        │   ├── prisma.ts                 # Singleton PrismaClient
        │   ├── supabase.ts               # Supabase clients + DB types
        │   ├── openai.ts                 # GPT-4 / DALL-E helpers
        │   ├── currency.ts               # CBA exchange rates + format
        │   ├── translations.ts           # DeepL / Google Translate
        │   ├── security.ts               # AES Wi-Fi encrypt, slug, rate-limit
        │   └── image-processing.ts       # Sharp resize (lg/md/sm WebP)
        │
        ├── stores/
        │   ├── auth.ts                   # Zustand auth store (persisted)
        │   └── menu.ts                   # Zustand menu prefs (lang, currency)
        │
        └── types/
            └── index.ts                  # TS interfaces, PLAN_LIMITS, LANGUAGES, CURRENCIES
```

---

## 3. Route Map

### 3.1 Pages (App Router)

| Route | Type | Auth | Description | Status |
|---|---|---|---|---|
| `/` | SSR | Public | Landing page (Next.js) | ✅ Working |
| `/login` | Client | Guest-only | Login with demo accounts | ✅ Working |
| `/register` | Client | Guest-only | 3-step registration | ✅ UI only |
| `/forgot-password` | Client | Guest-only | Password reset | ✅ UI only |
| `/dashboard` | Client | Protected | KPI overview (hardcoded data) | ✅ UI only |
| `/dashboard/dishes` | Client | Protected | Dish library | ✅ UI only |
| `/dashboard/dishes/new` | Client | Protected | Add dish form | ✅ UI only |
| `/dashboard/dishes/[id]` | Client | Protected | Edit dish | ✅ UI only |
| `/dashboard/menus` | Client | Protected | Menu list | ✅ UI only |
| `/dashboard/menus/[id]/edit` | Client | Protected | Menu editor | ✅ UI only |
| `/dashboard/tables` | Client | Protected | Table/NFC management | ✅ UI only |
| `/dashboard/analytics` | Client | Protected | Analytics charts | ✅ UI only |
| `/dashboard/ai-assistant` | Client | Protected | AI chat | ✅ UI only |
| `/dashboard/settings` | Client | Protected | Restaurant settings | ✅ UI only |
| `/admin` | Client | Admin-only | Super-admin dashboard | ✅ UI only |
| `/admin/restaurants` | Client | Admin-only | Restaurants list | ✅ UI only |
| `/admin/users` | Client | Admin-only | User management | ✅ UI only |
| `/admin/subscriptions` | Client | Admin-only | Subscriptions | ✅ UI only |
| `/admin/leads` | Client | Admin-only | Lead management | ✅ UI only |
| `/admin/analytics` | Client | Admin-only | Platform analytics | ✅ UI only |
| `/admin/revenue` | Client | Admin-only | Revenue dashboard | ✅ UI only |
| `/admin/settings` | Client | Admin-only | Platform settings | ✅ UI only |
| `/menu/[slug]` | SSR/ISR | Public | Public restaurant menu | ✅ Demo data |
| `/contact` | Client | Public | Contact form | ✅ Working |
| `/pricing` | Client | Public | Pricing page | ✅ Working |
| `/how-it-works` | Client | Public | How it works | ✅ Working |
| `/dev` | Client | Dev-only | Dev shortcuts | ✅ Dev only |

### 3.2 API Routes

| Endpoint | Methods | Auth | Status | Notes |
|---|---|---|---|---|
| `/api/auth/login` | POST | Public | ✅ Working | Demo + Supabase auth |
| `/api/auth/logout` | POST | Authenticated | ✅ Working | Clears cookies |
| `/api/dishes` | GET, POST | Authenticated | ⚠️ Partial | GET works with DB; POST creates but no image/validation |
| `/api/exchange-rates` | GET | Public | ✅ Working | CBA API + fallback |
| `/api/leads` | GET, POST, PATCH | Mixed | ✅ Working | In-memory fallback if no Supabase |
| `/api/upload` | POST | Authenticated | ⚠️ Needs Supabase | Requires Supabase storage bucket |
| `/api/ai/chat` | POST | Authenticated | ⚠️ Needs OpenAI key | GPT-4 assistant |

### 3.3 Static HTML Pages (Legacy Landing)

| File | Description | Status |
|---|---|---|
| `index.html` | Main landing | ✅ Active |
| `pricing.html` | Pricing | ✅ Active |
| `how-it-works.html` | How it works | ✅ Active |
| `contact.html` | Contact | ✅ Active |
| `luxe.html` | LUXE tier promo | ✅ Active |
| `app.html` | App overview | ✅ Active |
| `login.html` | Legacy login | ⚠️ Superseded by Next.js |
| `menu.html` | Legacy demo menu | ⚠️ Superseded by Next.js |
| `analytics.html` | Legacy analytics | ⚠️ Superseded by Next.js |
| `settings.html` | Legacy settings | ⚠️ Superseded by Next.js |
| `waiter.html` | Waiter helper | ℹ️ Standalone |
| `competitor_analysis.html` | Competitor analysis | ℹ️ Internal doc |
| `TapMenu_Armenia_TZ.html` | Tech spec v2.1 (RU) | ℹ️ Internal doc |

---

## 4. Database Schema Audit

### 4.1 Prisma Models (13 models, 5 enums)

| Model | Table Name | Fields | Relations | Status |
|---|---|---|---|---|
| User | `users` | 11 | restaurants[], subscription? | ✅ Defined |
| Restaurant | `restaurants` | 19 | user, dishes[], menus[], tables[], menuViews[] | ✅ Defined |
| Subscription | `subscriptions` | 12 | user, paymentHistory[] | ✅ Defined |
| Dish | `dishes` | 20 | restaurant, menuDishes[] | ✅ Defined |
| Menu | `menus` | 10 | restaurant, categories[], menuDishes[] | ✅ Defined |
| Category | `categories` | 8 | menu, menuDishes[] | ✅ Defined |
| MenuDish | `menu_dishes` | 6 | menu, dish, category? | ✅ Defined |
| Table | `tables` | 6 | restaurant | ✅ Defined |
| MenuView | `menu_views` | 8 | restaurant | ✅ Defined |
| ExchangeRate | `exchange_rates` | 4 | — | ✅ Defined |
| Lead | `leads` | 9 | — | ✅ Defined |
| PaymentHistory | `payment_history` | 7 | subscription | ✅ Defined |
| AiConversation | `ai_conversations` | 6 | — | ✅ Defined |

### 4.2 Prisma ↔ Supabase Migration Diff

| Aspect | Prisma Schema | Supabase Migrations | Gap |
|---|---|---|---|
| Users | ✅ Full | ✅ 001_initial | Aligned |
| Restaurants | ✅ Full | ✅ 001_initial | Aligned |
| Subscriptions | ✅ Full | ✅ 001_initial | Aligned |
| Dishes | ✅ Full | ✅ 001_initial | Aligned |
| Menus | ✅ Full | ✅ 001_initial | Aligned |
| Categories | ✅ Full | ✅ 001_initial | Aligned |
| MenuDish | ✅ Full | ✅ 001_initial | Aligned |
| Tables | ✅ Full | ✅ 001_initial | Aligned |
| MenuViews | ✅ Full | ✅ 001_initial | Aligned |
| ExchangeRates | ✅ Full | ✅ 001_initial (with seed) | Aligned |
| Leads | ✅ Full | ✅ 0002_leads_table (with RLS) | Aligned |
| PaymentHistory | ✅ Full | ✅ 001_initial | Aligned |
| AiConversation | ✅ Full | ✅ 001_initial | Aligned |
| RLS Policies | N/A | ✅ Defined for leads | ⚠️ Missing RLS for other tables |
| Duplicate migration | — | `001_initial` and `0001_initial` | ⚠️ Duplicate file |

### 4.3 Missing from DB but needed for MVP

| Table/Feature | Purpose | Priority |
|---|---|---|
| `orders` | Guest ordering system | Phase 01 |
| `order_items` | Order line items | Phase 01 |
| `feature_flags` | Runtime feature toggles | Phase 00 (scaffold only) |
| `notifications` | In-app notifications | Phase 02 |
| `pos_integrations` | POS connector configs | Phase 04 |
| `payment_transactions` | Payment processor records | Phase 03 |
| RLS for all tables | Row-level security | Phase 01 |

---

## 5. Component Inventory

### 5.1 Landing Components (10)

All in `src/components/landing/`:
- `LandingHeader.tsx` — Responsive navbar with mobile menu
- `HeroSection.tsx` — Hero with CTA
- `StatsSection.tsx` — Statistics bar
- `FeaturesSection.tsx` — Feature grid with icons
- `HowItWorksSection.tsx` — Step-by-step guide
- `PricingSection.tsx` — Plan cards with toggle (monthly/yearly)
- `FAQSection.tsx` — Accordion FAQ
- `ContactSection.tsx` — Contact form
- `CTASection.tsx` — Final call to action
- `LandingFooter.tsx` — Footer with links

### 5.2 UI Primitives (6)

All in `src/components/ui/`:
- `badge.tsx` — Badge variants
- `button.tsx` — Button variants (CVA-based)
- `card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `input.tsx` — Input component
- `select.tsx` — Select component
- `textarea.tsx` — Textarea component

### 5.3 Page-Embedded Components

| Page | Embedded Components | Notes |
|---|---|---|
| `PublicMenuClient.tsx` | DishCard, CartDrawer, DishModal, CategoryTabs, SearchBar | ~800 lines, should be extracted |
| `dashboard/layout.tsx` | Sidebar, TopBar, NavItem | ~400 lines, should be extracted |
| `admin/page.tsx` | StatsGrid, RevenueCards, RestaurantsTable | ~400 lines, should be extracted |

---

## 6. Library / Utility Inventory

| File | Exports | External Deps | Status |
|---|---|---|---|
| `lib/utils.ts` | `cn()` | clsx, tailwind-merge | ✅ Ready |
| `lib/prisma.ts` | `prisma` (singleton) | @prisma/client | ✅ Ready |
| `lib/supabase.ts` | `supabase`, `supabaseAdmin`, `isSupabaseConfigured()`, DB types | @supabase/supabase-js | ✅ Ready |
| `lib/openai.ts` | `generateMenuDescription()`, `translateDishContent()`, `aiMenuAssistant()`, `generateDishImage()` | openai | ⚠️ Needs API key |
| `lib/currency.ts` | `getExchangeRates()`, `convertPrice()`, `formatPrice()` | — (fetch) | ✅ Ready |
| `lib/translations.ts` | `translateWithDeepL()`, `translateWithGoogle()`, `translateDish()`, `translateMenu()` | — (fetch) | ⚠️ Needs API keys |
| `lib/security.ts` | `encryptWifiPassword()`, `decryptWifiPassword()`, `sanitizeSlug()`, `generateUniqueSlug()`, `checkRateLimit()` | crypto | ✅ Ready |
| `lib/image-processing.ts` | `IMAGE_SIZES`, image resize utils | sharp | ⚠️ Needs Supabase storage |

### 6.1 Stores

| File | Store Name | Persisted | Key State |
|---|---|---|---|
| `stores/auth.ts` | `useAuthStore` | Yes (`tapmenu-auth`) | user, restaurant, subscription |
| `stores/menu.ts` | `useMenuStore` | Yes (`tapmenu-menu-prefs`) | selectedLang, selectedCurrency |

---

## 7. Authentication Flow

```
                    ┌──────────────────────┐
                    │   Login Page          │
                    │ /login                │
                    └──────┬───────────────┘
                           │
                    ┌──────▼───────────────┐
                    │  POST /api/auth/login │
                    └──────┬───────────────┘
                           │
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
       Demo Account   Supabase Auth    (Future: OAuth)
       (hardcoded)    (signInWithPassword)
              │            │
              └────────────┼────────────────┐
                           ▼                │
                    Set Cookies:            │
                    - sb-access-token       │
                    - user-role             │
                    - user-name             │
                           │                │
                    ┌──────▼───────────────┐│
                    │  Middleware           ││
                    │  - Check cookies     ││
                    │  - Protect routes    ││
                    │  - Role-based access ││
                    └──────────────────────┘│
```

**Demo Accounts (always available):**
- Owner: `owner@demo.com` / `demo1234` → role `owner`
- Admin: `admin@tapmenu.am` / `admin1234` → role `superadmin`

---

## 8. External Service Dependencies

| Service | Purpose | Env Var | Status |
|---|---|---|---|
| PostgreSQL | Primary database | `DATABASE_URL` | ❌ Not connected |
| Supabase Auth | Authentication | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ Placeholder |
| Supabase Storage | Image storage | `SUPABASE_SERVICE_ROLE_KEY` | ❌ Not connected |
| OpenAI GPT-4 | AI dish descriptions, chat | `OPENAI_API_KEY` | ❌ Not configured |
| Central Bank of Armenia | Exchange rates | — (public API) | ✅ Ready |
| DeepL | Premium translation | `DEEPL_API_KEY` | ❌ Not configured |
| Google Translate | Fallback translation | `GOOGLE_TRANSLATE_API_KEY` | ❌ Not configured |
| Resend | Email notifications | `RESEND_API_KEY`, `ADMIN_EMAIL` | ❌ Not configured |
| Vercel | Hosting + crons | — | ⚠️ Config ready, not deployed |

---

## 9. Known Issues & Technical Debt

| # | Issue | Severity | Location |
|---|---|---|---|
| 1 | No real PostgreSQL database connected | Critical | Infrastructure |
| 2 | Supabase Auth not connected (demo-only) | Critical | Auth flow |
| 3 | Duplicate migration files (001 vs 0001) | Low | supabase/migrations/ |
| 4 | Dashboard uses 100% hardcoded data | High | dashboard/**/* |
| 5 | Admin panel uses 100% hardcoded data | High | admin/**/* |
| 6 | PublicMenuClient.tsx is ~800 lines (monolith) | Medium | menu/[slug]/ |
| 7 | No error boundary components | Medium | Global |
| 8 | No loading states (Suspense/skeletons) | Medium | Global |
| 9 | Registration form has no backend handler | High | (auth)/register |
| 10 | Forgot-password has no backend handler | High | (auth)/forgot-password |
| 11 | No CRUD APIs for menus, categories, tables | High | API routes |
| 12 | No image upload connected (needs storage) | High | API upload |
| 13 | No tests of any kind | High | — |
| 14 | No CI/CD pipeline | Medium | — |
| 15 | RLS only for leads table | High | Supabase |
| 16 | `hasAi` flag exists but no middleware enforcement | Medium | types/index.ts |
| 17 | Static HTML pages partially overlap with Next.js pages | Low | Root HTML files |
| 18 | No API for restaurants CRUD | High | API routes |

---

## 10. Subscription Plan Limits (source of truth: `types/index.ts`)

| Feature | Starter | Pro | Premium | Luxe |
|---|---|---|---|---|
| Max Menus | 1 | 3 | 10 | Unlimited |
| Max Dishes | 30 | 100 | 500 | Unlimited |
| Max Languages | 2 | 5 | 20 | 33 |
| Max NFC Tags | 1 | 5 | 20 | Unlimited |
| Analytics | ❌ | ✅ | ✅ | ✅ |
| AI Features | ❌ | ❌ | ❌ | ✅ |
| DeepL Translation | ❌ | ❌ | ✅ | ✅ |
| Custom Template | ❌ | ❌ | ✅ | ✅ |
| Price/mo | $15 | $25 | $45 | $50 |
| Price/yr (per mo) | $12 | $20 | $36 | $40 |

---

## 11. Supported Languages & Currencies

**Languages:** 33 total (ru, en, hy, ar, zh, fr, de, es, it, ja, ko, tr, pl, pt, nl, sv, da, fi, no, cs, sk, hu, ro, bg, hr, sr, uk, ka, he, fa, vi, th, id)

**Currencies:** AMD (֏), USD ($), EUR (€), RUB (₽), GBP (£)

**Base currency:** AMD (Armenian Dram) — all prices stored in AMD.
