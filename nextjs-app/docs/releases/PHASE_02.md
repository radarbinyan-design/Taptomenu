# Phase 02 — Admin/Owner Cabinet

**Date**: 2026-03-24
**Branch**: `genspark_ai_developer`
**Status**: Complete

## Summary

Phase 02 connects all dashboard pages to the real CRUD APIs built in Phase 01.
Every page now fetches data from the database when available, and gracefully
falls back to demo data when no database is configured.

## Deliverables

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useApi.ts` | Generic fetch hook with loading/error/abort/mutation support |
| `src/hooks/index.ts` | Domain hooks: useRestaurant, useDishes, useMenus, useCategories, useTables, useMenuViews |
| `src/components/shared/Toast.tsx` | Global toast notification context + provider |
| `src/app/api/auth/register/route.ts` | POST /api/auth/register — Supabase Auth + Prisma user/restaurant/subscription creation |
| `src/app/api/auth/forgot-password/route.ts` | POST /api/auth/forgot-password — password reset via Supabase |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/dashboard/layout.tsx` | Added ToastProvider, restaurant data loading from API into Zustand, dynamic sidebar restaurant name |
| `src/app/dashboard/page.tsx` | Stats row (dishes/menus/tables/views) from real APIs; dynamic menu preview link |
| `src/app/dashboard/dishes/page.tsx` | Full API integration: create/update/delete via /api/dishes, loading states, error handling, demo fallback |
| `src/app/dashboard/tables/page.tsx` | Full API integration: CRUD via /api/tables, dynamic QR URL with real slug, demo fallback |
| `src/app/dashboard/settings/page.tsx` | Saves to /api/restaurants/[id] PATCH; loads restaurant data from Zustand; dynamic form fields |
| `src/app/dashboard/menus/page.tsx` | Full API integration: CRUD via /api/menus, loading states, duplicate/default/status toggle, demo fallback |
| `src/app/dashboard/analytics/page.tsx` | Connected to /api/menu-views: total views, views-by-lang, views-by-device, views-by-day; period toggle; demo fallback |

### Architecture Decisions

1. **Demo-first pattern**: Every page checks `isUsingRealData` — if API returns data, use it; otherwise keep hardcoded demo data. Zero breaking changes.
2. **Hooks layer**: `useApi` provides generic fetch + mutate; domain hooks (`useDishes`, etc.) provide typed CRUD with `refetch`.
3. **Toast context**: Centralized via React Context in dashboard layout; avoids prop drilling.
4. **Auth flow**: Registration creates Supabase auth user + Prisma user/restaurant/subscription in a single transaction with 14-day trial.
5. **Backward compatibility**: All existing pages continue to work unchanged. Demo data always available as fallback.

### API Inventory Update

| Endpoint | Method | Phase | Notes |
|----------|--------|-------|-------|
| `/api/auth/register` | POST | 02 | Creates user + restaurant + subscription |
| `/api/auth/forgot-password` | POST | 02 | Sends Supabase password reset email |
| Previous 18 endpoints | — | 00–01 | Unchanged |

**Total: 20 active API endpoints**

### What Was NOT Changed

- AI assistant page (Phase 03+ scope)
- Admin panel pages (superadmin scope, not owner cabinet)
- Public menu page (already uses Prisma SSR)
- Landing pages and static HTML
- Top dishes analytics (requires dish-level view tracking, Phase 03)
- Hourly traffic chart (no hourly grouping in API yet, Phase 03)

## TypeScript Status

```
npx tsc --noEmit → 0 errors
```

## Verification Steps

1. `npm run dev` -> Dashboard loads with stats row
2. Navigate to Dishes -> shows demo data; create/edit/delete work locally
3. Navigate to Tables -> shows demo data; CRUD works
4. Navigate to Menus -> shows demo data; create/edit/delete/duplicate/set-default work
5. Navigate to Analytics -> shows demo data; period toggle (week/month); refresh button
6. Navigate to Settings -> form loads; save shows toast
7. If Supabase + Prisma are configured: all pages show real data from DB

## Rollback

This phase only adds new files and modifies dashboard UI pages.
To rollback: revert this commit. No DB migrations were added.

## Next Phase

**Phase 03 — Transformer + Advanced Analytics**:
- Dish-level view tracking and top-dishes analytics
- Hourly traffic aggregation in API
- AI-powered menu translation (FF_TRANSFORMER)
- DeepL/Google Translate integration
- Menu import from photos (OCR pipeline)
