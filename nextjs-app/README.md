# TapMenu Armenia v2.0 — SaaS NFC Digital Menu Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com)

## 🌍 URLs
- **Production landing**: https://tapmenu.am
- **Owner Dashboard**: https://app.tapmenu.am *(→ /dashboard)*
- **Public Menu**: https://menu.tapmenu.am/araratrest *(→ /menu/araratrest)*
- **Super Admin**: https://admin.tapmenu.am *(→ /admin)*
- **GitHub**: https://github.com/radarbinyan-design/Taptomenu
- **Sandbox**: https://3000-iwohn6b22s796hxme59pt-b32ec7bb.sandbox.novita.ai

## 🔑 Demo Credentials
| Role  | Email | Password | Redirect |
|-------|-------|----------|----------|
| Owner | owner@demo.com | demo1234 | /dashboard |
| Admin | admin@tapmenu.am | admin1234 | /admin |

## ✅ Implemented Features (Weeks 1–5)

### Week 1 — Foundation
- [x] Next.js 14 App Router, TypeScript strict, Tailwind + shadcn/ui
- [x] Prisma schema with all tables (users, restaurants, dishes, menus, tables, etc.)
- [x] Supabase auth integration with JWT + demo fallback
- [x] Middleware: protected routes, RBAC (owner/admin), dev override
- [x] API routes: `/api/auth/login`, `/api/auth/logout`, `/api/exchange-rates`, `/api/dishes`, `/api/ai/chat`, `/api/upload`, `/api/translations`

### Week 2 — Super Admin Panel `/admin`
- [x] MRR/ARR/ARPU/Churn KPI cards
- [x] Revenue by plan chart (SVG bar chart)
- [x] Searchable restaurant table with status badges
- [x] Plan distribution (Starter/Pro/Premium/LUXE)
- [x] Alerts panel (grace period, blocked, unpaid)
- [x] Quick-action buttons

### Week 3 — Owner Dashboard
- [x] `/dashboard` — overview with stats, recent views feed, quick actions
- [x] `/dashboard/dishes` — fully interactive dish library (filter/search, grouped/list view, all CRUD buttons, modal editor)
- [x] `/dashboard/menus` — **fully interactive**: create/edit/delete/duplicate menus, language selector, status toggle, set default, plan usage bar
- [x] `/dashboard/tables` — **fully interactive**: add/edit/delete tables, QR modal, NFC code generator, zone filter, URL copy, activation toggle
- [x] `/dashboard/analytics` — **SVG charts**: bar chart (views), line chart (hourly), donut (devices), language bars, top dishes, period toggle
- [x] `/dashboard/settings` — restaurant info, appearance, Wi-Fi, subscription tabs, **Security tab** (password change, active sessions)
- [x] `/dashboard/ai-assistant` — AI chat UI (LUXE plan)

### Week 4 — Dish Library
- [x] `/dashboard/dishes/new` — 3-tab form (basic, translations, nutrition/allergens)
- [x] `/dashboard/dishes/[id]` — **full dish editor**: photo upload + drag&drop, emoji picker, AI translation mock, allergens, dietary tags, spicy level
- [x] `/dashboard/menus/[id]/edit` — **drag-and-drop menu editor**: DnD category/dish sorting, add/edit/delete categories, library modal, inline category editing, dish visibility toggle

### Week 5 — Public Menu
- [x] `/menu/[slug]` — ISR (60s), SSR with Prisma, demo fallback
- [x] `PublicMenuClient` — **fully interactive**:
  - 🛒 **Shopping cart with bottom drawer** — add/remove/qty, "Call waiter" button, order confirmation screen
  - 📖 **Dish detail modal** — bottom sheet with full info, nutrition, allergens, dietary badges
  - ❤️ **Favorites** — mark favorite dishes
  - 🌍 Language switcher (RU/EN/HY/AR)
  - 💱 Currency switcher (AMD/USD/EUR/RUB/GBP) with CBA rates
  - 🔍 Full-text search across name + description
  - 📜 Category tabs with smooth scroll
  - 📡 Wi-Fi password display
  - Scroll-to-top button

### Auth Pages
- [x] `/login` — dark gradient design, quick-login buttons, register CTA
- [x] `/register` — 3-step flow (account → plan → success)
- [x] `/forgot-password` — email form + confirmation

## 🏗️ Architecture

```
nextjs-app/
├── src/
│   ├── app/
│   │   ├── (auth)/               # Login, Register, ForgotPassword
│   │   ├── admin/                # Super-admin panel
│   │   ├── api/                  # REST API routes
│   │   │   ├── auth/             # Login/logout
│   │   │   ├── dishes/           # Dish CRUD
│   │   │   ├── exchange-rates/   # CBA rates
│   │   │   ├── ai/chat/          # OpenAI integration
│   │   │   ├── translations/     # DeepL/Google Translate
│   │   │   └── upload/           # File upload (Sharp)
│   │   ├── dashboard/            # Owner dashboard
│   │   │   ├── dishes/           # Dish library + editors
│   │   │   │   ├── page.tsx      # Dish list (interactive)
│   │   │   │   ├── new/          # Create dish
│   │   │   │   └── [id]/         # Edit dish
│   │   │   ├── menus/            # Menu management
│   │   │   │   ├── page.tsx      # Menu list (interactive)
│   │   │   │   └── [id]/edit/    # Menu editor with DnD
│   │   │   ├── tables/           # NFC table management
│   │   │   ├── analytics/        # SVG analytics
│   │   │   ├── settings/         # Restaurant settings
│   │   │   └── ai-assistant/     # AI chat (LUXE)
│   │   ├── menu/[slug]/          # Public menu (ISR)
│   │   │   ├── page.tsx          # Server component (SSR/ISR)
│   │   │   └── PublicMenuClient.tsx  # Cart, modals, lang/currency
│   │   └── page.tsx              # Landing page
│   ├── components/               # Reusable components
│   ├── lib/                      # Utils (Prisma, Supabase, OpenAI, Sharp)
│   └── types/                    # TypeScript types + constants
├── prisma/                       # DB schema
└── ecosystem.config.cjs          # PM2 config
```

## 📊 Data Models
- **User** — role (owner/admin/superadmin), subscriptionPlan (starter/pro/premium/luxe)
- **Restaurant** — name, slug, colors, template, wifiName (AES-256 encrypted)
- **Dish** — multilingual name/desc, price (AMD), WebP images (3 sizes via Sharp), nutrition, tags, allergens
- **Menu** — linked to restaurant, multiple categories with DnD order
- **Category** — sortOrder, emoji, multilingual name
- **Table** — NFC tag ID, QR, zone, viewCount

## 💰 Tariff Plans
| Plan | Price | Menus | Dishes | Languages | NFC tags |
|------|-------|-------|--------|-----------|----------|
| Starter | $15/mo | 1 | 50 | 2 | 3 |
| Pro | $25/mo | 3 | 100 | 5 | 8 |
| Premium | $45/mo | 10 | 500 | 20 | ∞ |
| LUXE | $50+/mo | ∞ | ∞ | 33 | ∞ |

## 🚀 Remaining Roadmap

### Week 6 — Integrations
- [ ] Real Supabase DB connection + full CRUD APIs
- [ ] Vercel cron for CBA exchange rates (09:00 Yerevan)
- [ ] Menu view analytics tracking
- [ ] Real NFC/QR code generation (qrcode library)
- [ ] Sharp image processing on upload

### Week 7 — Landing & Wi-Fi
- [ ] Public landing page polish
- [ ] Wi-Fi password QR generation
- [ ] Contact form with Resend email
- [ ] Special offers / promo section

### Week 8 — LUXE & Deploy
- [ ] LUXE template (V-template)
- [ ] Real AI assistant (GPT-4o)
- [ ] Real DeepL translation API
- [ ] Vercel production deploy
- [ ] Custom domain setup (tapmenu.am, app.tapmenu.am, menu.tapmenu.am)
- [ ] Rate limiting, security hardening

## 🛠️ Development

```bash
# Start server
pm2 start ecosystem.config.cjs

# Build
npm run build

# Test auth API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@demo.com","password":"demo1234"}'
```

## 🔐 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://...
OPENAI_API_KEY=...
DEEPL_API_KEY=...
RESEND_API_KEY=...
WIFI_ENCRYPTION_KEY=...
NEXT_PUBLIC_APP_URL=https://app.tapmenu.am
```

---
*Last updated: March 2026 | TapMenu Armenia © 2026*
