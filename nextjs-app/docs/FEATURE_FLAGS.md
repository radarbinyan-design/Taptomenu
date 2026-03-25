# TapMenu Armenia — Feature Flags Reference

> Updated: PHASE 04, 2026-03-24

## Overview

All new features are gated behind feature flags defined in `src/lib/feature-flags.ts`. This ensures:
- No accidental exposure of incomplete features
- Gradual rollout per restaurant, tariff, or globally
- Easy rollback by flipping a flag

## How to Enable a Flag

### Method 1: Environment Variable (fastest)

Add to `.env.local`:
```env
NEXT_PUBLIC_FF_GUEST_ORDERING=true
FF_GUEST_ORDERING=true
```
Note: Use `NEXT_PUBLIC_` prefix for client-side checks.

### Method 2: Database (production, Phase 01+)

Insert into `feature_flags` table:
```sql
INSERT INTO feature_flags (key, enabled, scope, description)
VALUES ('FF_GUEST_ORDERING', true, 'global', 'Guest ordering enabled');
```

### Method 3: Plan-Based (automatic)

Tariff-scoped flags auto-enable for specified plans. No manual action needed.

## Flag Inventory

| Flag | Phase | Scope | Default | Plans |
|---|---|---|---|---|
| `FF_REAL_ANALYTICS` | 02 | global | off | — |
| `FF_AI_TRANSLATION` | 02 | tariff | off | premium, luxe |
| `FF_GUEST_ORDERING` | 03 | global | off | — |
| `FF_CALL_WAITER` | 03 | restaurant | off | — |
| `FF_REVIEWS` | 03 | restaurant | off | — |
| `FF_NOTIFICATIONS` | 03 | global | off | — |
| `FF_PAYMENTS` | 04 | global | off | — |
| `FF_PLAN_ENFORCEMENT` | 04 | global | off | — |
| `FF_TRANSFORMER` | 05 | global | off | — |
| `FF_BULK_IMPORT` | 05 | tariff | off | pro, premium, luxe |
| `FF_POS_LAYER` | 06 | global | off | — |
| `FF_POS_RKEEPER` | 06 | restaurant | off | — |
| `FF_POS_IIKO` | 06 | restaurant | off | — |

## Usage Examples

### In API Routes (server)
```ts
import { requireFeature } from '@/lib/feature-flags'

export async function POST(request: NextRequest) {
  requireFeature('FF_GUEST_ORDERING') // throws 403 if disabled
  // ... handle order
}
```

### In React Components (client)
```tsx
import { isFeatureEnabled } from '@/lib/feature-flags'

function MenuPage() {
  const canOrder = isFeatureEnabled('FF_GUEST_ORDERING')
  return canOrder ? <CartButton /> : null
}
```

### With Plan Context
```ts
const canTranslate = isFeatureEnabled('FF_AI_TRANSLATION', {
  plan: user.subscription.plan, // 'luxe' -> true
})
```
