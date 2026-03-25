# Release Notes — PHASE 01: Guest App & Real Data

**Date:** 2026-03-24
**Branch:** `genspark_ai_developer`
**Breaking Changes:** None
**Feature Flag:** `FF_GUEST_ORDERING` (off by default)

---

## Summary

Phase 01 establishes the complete CRUD API layer, guest ordering system, Zod validation, database schema for orders, subscription limit enforcement, menu view analytics tracking, and demo seed data. All new ordering functionality is gated behind the `FF_GUEST_ORDERING` feature flag.

---

## New Database Models

| Model | Table | Purpose |
|---|---|---|
| `Order` | `orders` | Guest orders with status workflow |
| `OrderItem` | `order_items` | Individual dish items in an order |

**Migration:** `supabase/migrations/0003_orders_tables.sql`

**Order status workflow:**
```
pending → confirmed → preparing → ready → delivered
    ↓         ↓           ↓
 cancelled cancelled  cancelled
```

---

## New API Endpoints (11)

| Endpoint | Methods | Auth | Feature Flag |
|---|---|---|---|
| `/api/restaurants` | GET, POST | Auth | — |
| `/api/restaurants/[id]` | GET, PATCH, DELETE | Auth | — |
| `/api/menus` | GET, POST | Auth | — |
| `/api/menus/[id]` | GET, PATCH, DELETE, PUT | Auth | — |
| `/api/categories` | GET, POST | Auth | — |
| `/api/categories/[id]` | PATCH, DELETE | Auth | — |
| `/api/tables` | GET, POST | Auth | — |
| `/api/tables/[id]` | PATCH, DELETE | Auth | — |
| `/api/dishes/[id]` | GET, PATCH, DELETE | Auth | — |
| `/api/orders` | GET, POST | Mixed | `FF_GUEST_ORDERING` |
| `/api/orders/[id]` | GET, PATCH | Auth | — |
| `/api/menu-views` | GET, POST | Mixed | — |

---

## Enhanced Existing Code

| File | Changes |
|---|---|
| `/api/dishes/route.ts` | Zod validation, subscription limit check, structured logging |
| `prisma/schema.prisma` | Added Order, OrderItem models + OrderStatus enum + relations |
| `src/types/index.ts` | Added Order, OrderItem, OrderStatus types |
| `tsconfig.json` | Added `target`, `downlevelIteration` to fix Set iteration |

---

## New Infrastructure

| File | Description |
|---|---|
| `src/lib/validators.ts` | 15 Zod schemas for all API inputs (Restaurant, Dish, Menu, Category, Table, Order, MenuView, Auth, Lead) |
| `src/stores/cart.ts` | Zustand cart store with persistence (add, remove, update quantity, clear, totals) |
| `scripts/seed.ts` | Database seed: demo owner, admin, restaurant, 4 categories, 8 dishes, 4 tables, exchange rates |
| `supabase/migrations/0003_orders_tables.sql` | Orders + order_items tables with RLS policies |

---

## Subscription Limit Enforcement

| Entity | Check Location | Behavior |
|---|---|---|
| Dishes | `POST /api/dishes` | Counts non-archived dishes, returns 403 if limit reached |
| Menus | `POST /api/menus` | Counts menus per restaurant, returns 403 if limit reached |
| Tables | `POST /api/tables` | Counts tables per restaurant, returns 403 if limit reached |

---

## Files Created (17 new)

```
nextjs-app/
├── supabase/migrations/0003_orders_tables.sql
├── scripts/seed.ts
├── src/
│   ├── lib/validators.ts
│   ├── stores/cart.ts
│   └── app/api/
│       ├── restaurants/route.ts
│       ├── restaurants/[id]/route.ts
│       ├── menus/route.ts
│       ├── menus/[id]/route.ts
│       ├── categories/route.ts
│       ├── categories/[id]/route.ts
│       ├── tables/route.ts
│       ├── tables/[id]/route.ts
│       ├── dishes/[id]/route.ts
│       ├── orders/route.ts
│       ├── orders/[id]/route.ts
│       └── menu-views/route.ts
└── docs/releases/PHASE_01.md
```

## Files Modified (4)

```
nextjs-app/
├── prisma/schema.prisma              # +Order, OrderItem, OrderStatus, relations
├── src/types/index.ts                # +Order, OrderItem, OrderStatus types
├── src/app/api/dishes/route.ts       # Zod validation, subscription limit, logger
├── src/app/dashboard/menu-editor/page.tsx  # Fix Set iteration
└── tsconfig.json                     # Add target, downlevelIteration
```

---

## How to Verify

1. **Type check:** `npx tsc --noEmit` → 0 errors
2. **Prisma:** `npx prisma generate` → Success
3. **Feature flag:** `isFeatureEnabled('FF_GUEST_ORDERING')` → `false` (safe default)
4. **Seed:** With DB connected: `npx ts-node scripts/seed.ts`
5. **All existing pages:** Render unchanged

---

## Rollback

Remove new files and revert modified files:
```bash
# Remove new files
rm -rf src/app/api/{restaurants,menus,categories,tables,orders,menu-views,dishes/\\[id\\]}
rm src/lib/validators.ts src/stores/cart.ts scripts/seed.ts
rm supabase/migrations/0003_orders_tables.sql docs/releases/PHASE_01.md

# Revert modified files via git
git checkout HEAD -- prisma/schema.prisma src/types/index.ts src/app/api/dishes/route.ts tsconfig.json
npx prisma generate
```

---

## Next Phase

**PHASE 02 — Admin/Owner Cabinet**
- Connect dashboard pages to real API endpoints
- Full CRUD UI for dishes, menus, categories, tables
- Real analytics from menu_views data
- Registration backend + password reset via email
- Supabase Storage integration for image upload
