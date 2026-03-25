# TapMenu Armenia — Architecture Guide

> Last updated: 2026-03-24

---

## Overview

TapMenu Armenia is a multi-tenant SaaS platform built with Next.js 14 (App Router). The system serves three primary user types:

1. **Guests** — View public restaurant menus, browse dishes, place orders
2. **Owners** — Manage their restaurant, dishes, menus, tables, and settings
3. **Admins/Superadmins** — Manage the platform, users, subscriptions, and leads

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, ISR, API routes, middleware |
| Language | TypeScript 5 | Type safety |
| Styling | Tailwind CSS 3.4 | Utility-first CSS |
| UI Components | Radix UI + shadcn/ui pattern | Accessible primitives |
| Animation | Framer Motion | Page/component transitions |
| State (client) | Zustand | Lightweight stores |
| Data Fetching | TanStack Query (planned) | Cache, mutation, optimistic updates |
| ORM | Prisma 5 | Type-safe database access |
| Database | PostgreSQL (via Supabase) | Primary data store |
| Auth | Supabase Auth | JWT-based authentication |
| Storage | Supabase Storage | Image hosting |
| AI | OpenAI GPT-4, DALL-E | Menu AI features |
| Translation | DeepL, Google Translate | Multi-language support |
| Email | Resend | Transactional email |
| Icons | Lucide React | Consistent iconography |
| Deployment | Vercel | Hosting, edge functions, cron |

---

## Data Flow

```
Guest/Owner Browser
        │
        ▼
┌─────────────────┐     ┌─────────────┐
│  Next.js Edge   │────▶│  Middleware  │
│  (Vercel/Node)  │     │  (auth,      │
│                 │     │   flags,     │
│                 │     │   redirect)  │
│                 │     └─────────────┘
│                 │
│  ┌──────────────┤
│  │ App Router   │
│  │ Pages (SSR/  │
│  │ Client)      │
│  ├──────────────┤
│  │ API Routes   │──────────────────────────┐
│  │ /api/*       │                          │
│  └──────┬───────┘                          │
│         │                                  │
│  ┌──────▼───────┐  ┌──────────────┐  ┌────▼────────┐
│  │  Prisma ORM  │  │  Supabase    │  │  External   │
│  │  (queries)   │  │  Auth + RLS  │  │  APIs       │
│  └──────┬───────┘  └──────┬───────┘  │  (OpenAI,   │
│         │                 │          │   CBA, etc.) │
│  ┌──────▼─────────────────▼───────┐  └─────────────┘
│  │       PostgreSQL               │
│  │  (Supabase-hosted or self)     │
│  └────────────────────────────────┘
└─────────────────┘
```

---

## Module Boundaries

Each feature module is self-contained and gated by a feature flag:

| Module | Flag | Scope | Files |
|---|---|---|---|
| Guest App | `FF_GUEST_ORDERING` | `src/modules/guest/` | Cart, order flow |
| Owner Cabinet | `FF_OWNER_CABINET` | `src/modules/owner/` | Real CRUD |
| Transformer | `FF_TRANSFORMER` | `src/modules/transformer/` | AI translations |
| Payments | `FF_PAYMENTS` | `src/modules/payments/` | Billing |
| POS | `FF_POS_LAYER` | `src/modules/pos/` | POS adapters |

Cross-module code lives in:
- `src/components/shared/` — Shared UI (FeatureGate, ErrorBoundary)
- `src/lib/` — Utilities (feature-flags, logger, prisma, supabase)
- `src/types/` — Shared TypeScript types

---

## Authentication Architecture

```
Browser ──▶ Middleware ──▶ Page/API
               │
     ┌─────────┼──────────┐
     ▼         ▼          ▼
  Supabase  Cookie-based  Demo
  Session   Fallback      Accounts
  (prod)    (dev/demo)    (always)
```

**Roles:** `owner` | `admin` | `superadmin`

**Route protection:**
- `/dashboard/*` → requires authentication
- `/admin/*` → requires `admin` or `superadmin` role
- `/login`, `/register` → redirects authenticated users

---

## Feature Flag System

Flags are evaluated in this priority order:
1. **Runtime overrides** (testing/admin toggle)
2. **Environment variables** (`FF_FLAG_NAME=true`)
3. **Plan-based gate** (user's subscription plan ≥ minPlan)
4. **Role-based gate** (user's role in allowedRoles)
5. **Default value** from registry

Server-side: `isFeatureEnabled('FF_FLAG', { plan, role })`
Client-side: `<FeatureGate flag="FF_FLAG">...</FeatureGate>`

---

## Database Design Principles

1. **UUIDs** as primary keys (gen_random_uuid)
2. **Soft deletes** via status enums (not physical deletion)
3. **Prices in AMD** (Armenian Dram) as integers (no floating point)
4. **JSONB** for translations (flexible key-value per language)
5. **Timestamps** with timezone (created_at, updated_at, auto-trigger)
6. **Additive migrations** only — never DROP columns in production
7. **Row-Level Security** enforced at Supabase layer

---

## Coding Conventions

- **File naming:** kebab-case for files, PascalCase for components
- **Imports:** `@/` alias for `src/`
- **Components:** Server components by default, `'use client'` only when needed
- **API routes:** Validate with Zod, return typed `ApiResponse<T>`
- **Error handling:** Try-catch with logger, user-friendly error messages
- **Styling:** Tailwind utility classes, `cn()` for conditional classes
- **State:** Zustand for client state, server components for server data
