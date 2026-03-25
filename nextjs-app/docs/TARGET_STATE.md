# TapMenu Armenia — TARGET STATE (to-be)

> Generated: 2026-03-24 | PHASE 00 — Foundation Audit
> Revision: 1.0

---

## 1. Vision

Evolve TapMenu Armenia from a UI-prototype into a fully operational MVP through incremental, non-breaking phases. Each phase adds one complete module with its own feature flag, migrations, API routes, components, and tests — while preserving every existing feature.

---

## 2. Module Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TAPMENU ARMENIA MVP                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │  GUEST APP  │  │ OWNER       │  │ ADMIN       │  │ SUPERADMIN   │  │
│  │  (Public)   │  │ CABINET     │  │ PANEL       │  │ PANEL        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘  │
│         │                │                │                 │          │
│  ┌──────▼──────────────────────────────────────────────────▼───────┐  │
│  │                     SHARED SERVICES LAYER                       │  │
│  │  ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────┐ ┌──────────────┐ │  │
│  │  │  Auth  │ │ Feature  │ │ i18n   │ │ AI   │ │ Notifications│ │  │
│  │  │ Module │ │  Flags   │ │ Engine │ │Engine│ │   Module     │ │  │
│  │  └────────┘ └──────────┘ └────────┘ └──────┘ └──────────────┘ │  │
│  └──────────────────────────┬──────────────────────────────────────┘  │
│                              │                                        │
│  ┌──────────────────────────▼──────────────────────────────────────┐  │
│  │                      DATA LAYER                                  │  │
│  │  ┌────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────────────┐  │  │
│  │  │ Prisma │ │ Supabase │ │  Supabase   │ │ External APIs    │  │  │
│  │  │  ORM   │ │   Auth   │ │  Storage    │ │ (CBA, DeepL,     │  │  │
│  │  │        │ │          │ │  (images)   │ │  OpenAI, POS)    │  │  │
│  │  └────────┘ └──────────┘ └─────────────┘ └──────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     INFRASTRUCTURE                               │  │
│  │  PostgreSQL │ Vercel/Docker │ Cron Jobs │ Logger │ Monitoring   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Target Repository Layout

```
nextjs-app/
├── docs/
│   ├── CURRENT_STATE.md            # As-is architecture
│   ├── TARGET_STATE.md             # This file
│   ├── ARCHITECTURE.md             # Detailed architecture
│   └── releases/
│       └── PHASE_00.md             # Phase 00 release notes
│
├── scripts/
│   ├── audit.sh                    # Code audit helper
│   └── seed.ts                     # Database seed script
│
├── tests/
│   ├── unit/                       # Unit tests
│   ├── integration/                # API integration tests
│   └── e2e/                        # End-to-end tests
│
├── prisma/
│   ├── schema.prisma               # Source of truth for DB
│   └── migrations/                 # Prisma managed migrations
│
├── supabase/
│   └── migrations/                 # Supabase-specific (RLS, triggers)
│
└── src/
    ├── middleware.ts                # Enhanced with feature-flag checks
    │
    ├── modules/                    # ★ NEW: Module-based architecture
    │   ├── guest/                  # Guest ordering module
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── api/
    │   │   └── types.ts
    │   │
    │   ├── owner/                  # Owner cabinet module
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── api/
    │   │   └── types.ts
    │   │
    │   ├── transformer/            # Menu transformer module
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── api/
    │   │   └── types.ts
    │   │
    │   ├── payments/               # Payments module
    │   │   ├── components/
    │   │   ├── providers/
    │   │   ├── api/
    │   │   └── types.ts
    │   │
    │   └── pos/                    # POS integration module
    │       ├── adapters/
    │       ├── api/
    │       └── types.ts
    │
    ├── app/                        # Existing routes preserved
    │   └── (unchanged + new module pages)
    │
    ├── components/
    │   ├── landing/                # Existing (unchanged)
    │   ├── ui/                     # Existing + expanded
    │   └── shared/                 # ★ NEW: Cross-module shared
    │       ├── ErrorBoundary.tsx
    │       ├── LoadingSkeleton.tsx
    │       ├── FeatureGate.tsx     # Feature-flag guard component
    │       └── AppShell.tsx
    │
    ├── lib/
    │   ├── (existing libs unchanged)
    │   ├── feature-flags.ts        # ★ NEW: Feature flag system
    │   ├── logger.ts               # ★ NEW: Structured logger
    │   └── validators.ts           # ★ NEW: Shared Zod schemas
    │
    ├── stores/
    │   ├── auth.ts                 # Existing (enhanced)
    │   ├── menu.ts                 # Existing (unchanged)
    │   └── cart.ts                 # ★ NEW: Cart state for ordering
    │
    └── types/
        ├── index.ts                # Existing (unchanged)
        └── modules.ts              # ★ NEW: Module-specific types
```

---

## 4. Phased Roadmap

### PHASE 00 — Foundation Audit ← CURRENT

**Goal:** Audit, document, scaffold infrastructure without changing any functionality.

| Deliverable | Description | Files |
|---|---|---|
| CURRENT_STATE.md | Full as-is documentation | docs/CURRENT_STATE.md |
| TARGET_STATE.md | Target architecture | docs/TARGET_STATE.md |
| Feature flag system | Runtime feature toggles | lib/feature-flags.ts |
| Logger | Safe structured logging | lib/logger.ts |
| Directory scaffold | docs/, scripts/, tests/ | Created |

**Rule:** Zero functional changes. Only additive documentation and scaffolding.

---

### PHASE 01 — Guest App & Real Data

**Feature Flag:** `FF_GUEST_ORDERING`

**Goal:** Connect real DB, make public menu work with live data, add cart & ordering.

| Task | Description |
|---|---|
| Connect PostgreSQL | Run Prisma migrate, seed demo data |
| Connect Supabase Auth | Real sign-up/sign-in flow |
| Restaurant CRUD API | `POST/GET/PATCH/DELETE /api/restaurants` |
| Menu CRUD API | `POST/GET/PATCH/DELETE /api/menus` |
| Category CRUD API | `POST/GET/PATCH/DELETE /api/categories` |
| Table CRUD API | `POST/GET/PATCH/DELETE /api/tables` |
| Public menu from DB | Replace demo data with real queries |
| Cart & ordering | Guest can add dishes, submit order |
| Orders table | New migration: `orders`, `order_items` |
| Menu view tracking | Record real analytics events |

**New DB tables:**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  table_id UUID REFERENCES tables(id),
  status TEXT DEFAULT 'pending', -- pending, confirmed, preparing, ready, delivered, cancelled
  total_amount INTEGER NOT NULL, -- AMD
  guest_name TEXT,
  guest_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES dishes(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL, -- AMD, snapshot at order time
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### PHASE 02 — Admin/Owner Cabinet

**Feature Flag:** `FF_OWNER_CABINET`

**Goal:** Make dashboard work with real data, full CRUD for all entities.

| Task | Description |
|---|---|
| Dashboard KPIs from DB | Real-time stats queries |
| Dish management | Full CRUD with image upload |
| Menu management | Drag-drop ordering, categories |
| Table management | QR code generation, NFC pairing |
| Analytics | Real chart data from menu_views |
| Settings | Restaurant profile edit, Wi-Fi config |
| Registration backend | Real user creation flow |
| Password reset | Email-based flow via Resend |
| Supabase Storage | Image upload bucket configuration |

---

### PHASE 03 — Transformer (AI-Powered)

**Feature Flag:** `FF_TRANSFORMER`

**Goal:** AI-powered menu translation, description generation, dish image generation.

| Task | Description |
|---|---|
| Batch translation | Translate entire menu to target languages |
| AI dish descriptions | Generate appetizing descriptions in any language |
| AI image generation | Generate dish photos via DALL-E |
| Translation management | UI for reviewing/editing AI translations |
| Usage tracking | Token usage per restaurant, quota enforcement |

---

### PHASE 04 — Payments

**Feature Flag:** `FF_PAYMENTS`

**Goal:** Subscription billing, plan enforcement, payment processing.

| Task | Description |
|---|---|
| Payment provider | Integrate Stripe or local Armenian processor |
| Subscription lifecycle | Trial → Active → Grace → Blocked flow |
| Plan enforcement | Middleware checks plan limits |
| Billing dashboard | Invoice history, plan upgrade/downgrade |
| Webhook handlers | Payment status webhooks |

---

### PHASE 05 — POS Integration

**Feature Flag:** `FF_POS_LAYER`

**Goal:** Connect to restaurant POS systems for order sync.

| Task | Description |
|---|---|
| POS adapter interface | Abstract adapter pattern |
| iiko adapter | Integration with iiko POS |
| R-Keeper adapter | Integration with R-Keeper POS |
| Order sync | Real-time order push to POS |
| Menu sync | Pull menu data from POS |

---

## 5. Feature Flag Definitions

| Flag | Scope | Default | Description |
|---|---|---|---|
| `FF_GUEST_ORDERING` | global | `false` | Enable guest cart & ordering |
| `FF_OWNER_CABINET` | global | `false` | Enable real data in dashboard |
| `FF_TRANSFORMER` | restaurant, plan | `false` | AI translation & generation |
| `FF_PAYMENTS` | global | `false` | Payment processing |
| `FF_POS_LAYER` | restaurant | `false` | POS integration |
| `FF_AI_ASSISTANT` | plan (luxe) | `false` | AI chat assistant |
| `FF_DEEPL_TRANSLATION` | plan (premium+) | `false` | DeepL translation |
| `FF_CUSTOM_TEMPLATE` | plan (premium+) | `false` | Custom menu templates |
| `FF_ANALYTICS` | plan (pro+) | `false` | Analytics dashboard |
| `FF_NFC_EXTENDED` | plan (pro+) | `false` | NFC tag management |

---

## 6. Development Rules

### 6.1 Non-Breaking Principles
1. **No refactors** of existing working code without migration plan
2. **Backward compatibility** — old URLs, APIs, cookies must keep working
3. **Feature-flag isolation** — new code behind flags, off by default
4. **Additive migrations** — only `CREATE TABLE`, `ADD COLUMN`, never `DROP`
5. **Demo mode preserved** — demo accounts always work

### 6.2 Branch Strategy
```
main ─────────────────────────────────────────────►
  │
  ├── phase/00-foundation ──── merge ──►
  │
  ├── phase/01-guest-app ───── merge ──►
  │
  ├── phase/02-owner-cabinet ─ merge ──►
  │
  └── ...
```

### 6.3 Commit Convention
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore, migrate
Scopes: guest, owner, admin, transformer, payments, pos, infra, ui, auth, db
```

### 6.4 Per-Phase Workflow
1. **Audit** current state of affected area
2. **File list** — list every file to be created/modified
3. **Plan** — describe changes with rationale
4. **Migrations** — write and review SQL/Prisma changes
5. **Implementation** — code with feature flags
6. **Tests** — unit + integration coverage
7. **Verification** — manual testing checklist
8. **Docs** — update CURRENT_STATE, write release notes
9. **Rollback notes** — document how to revert
10. **Commit** — squash, push, PR

---

## 7. Source-of-Truth Map

| Domain | Source of Truth | Location |
|---|---|---|
| DB schema | Prisma schema | `prisma/schema.prisma` |
| RLS policies | Supabase migrations | `supabase/migrations/` |
| Plan limits | TypeScript constants | `src/types/index.ts` → `PLAN_LIMITS` |
| Supported languages | TypeScript constants | `src/types/index.ts` → `SUPPORTED_LANGUAGES` |
| Currencies | TypeScript constants | `src/types/index.ts` → `CURRENCIES` |
| Feature flags | Feature flag config | `src/lib/feature-flags.ts` |
| API contracts | Route handlers + Zod schemas | `src/app/api/` |
| Component library | UI primitives | `src/components/ui/` |
| Architecture docs | Markdown | `docs/` |

---

## 8. MVP Success Criteria

| Metric | Target | Measured By |
|---|---|---|
| Public menu loads | < 2s TTFB | Vercel Analytics |
| Demo → Real login | Works with Supabase | E2E test |
| Dish CRUD | Full lifecycle | Integration test |
| Menu CRUD | Full lifecycle | Integration test |
| Guest can order | Cart → submit → confirm | E2E test |
| Owner sees real stats | Dashboard shows DB data | Manual QA |
| Plan limits enforced | Can't exceed quota | Unit test |
| Feature flags work | Toggle on/off cleanly | Unit test |
| Zero regressions | All existing pages render | Smoke test |
