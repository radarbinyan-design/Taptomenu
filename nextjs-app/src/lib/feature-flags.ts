/**
 * TapMenu Armenia — Feature Flag System
 *
 * Provides runtime feature toggles at global, restaurant, plan, and role scopes.
 * Flags are defined in a central registry and resolved against context.
 *
 * Usage:
 *   import { isFeatureEnabled, FeatureFlag } from '@/lib/feature-flags'
 *
 *   // Server-side
 *   if (isFeatureEnabled('FF_GUEST_ORDERING')) { ... }
 *
 *   // With context (plan-gated)
 *   if (isFeatureEnabled('FF_AI_ASSISTANT', { plan: 'luxe' })) { ... }
 *
 *   // Client-side React component
 *   <FeatureGate flag="FF_GUEST_ORDERING">
 *     <CartButton />
 *   </FeatureGate>
 *
 * Phase 00: Scaffold only — all flags default to false.
 * Flags will be moved to DB / remote config in Phase 02+.
 */

import type { SubscriptionPlan, UserRole } from '@/types'

// ─── Flag Definitions ─────────────────────────────────────────────────────────

export type FeatureFlag =
  | 'FF_GUEST_ORDERING'
  | 'FF_OWNER_CABINET'
  | 'FF_TRANSFORMER'
  | 'FF_PAYMENTS'
  | 'FF_POS_LAYER'
  | 'FF_AI_ASSISTANT'
  | 'FF_DEEPL_TRANSLATION'
  | 'FF_CUSTOM_TEMPLATE'
  | 'FF_ANALYTICS'
  | 'FF_NFC_EXTENDED'

export type FlagScope = 'global' | 'plan' | 'restaurant' | 'role'

export interface FlagDefinition {
  /** Human-readable description */
  description: string
  /** Which scope(s) this flag can be gated by */
  scopes: FlagScope[]
  /** Default value when no overrides match */
  defaultValue: boolean
  /** Minimum plan required (if scope includes 'plan') */
  minPlan?: SubscriptionPlan
  /** Allowed roles (if scope includes 'role') */
  allowedRoles?: UserRole[]
}

// ─── Central Registry ─────────────────────────────────────────────────────────

export const FLAG_REGISTRY: Record<FeatureFlag, FlagDefinition> = {
  FF_GUEST_ORDERING: {
    description: 'Enable guest cart & ordering on public menu',
    scopes: ['global'],
    defaultValue: false,
  },
  FF_OWNER_CABINET: {
    description: 'Enable real data in owner dashboard (replaces hardcoded demo)',
    scopes: ['global'],
    defaultValue: false,
  },
  FF_TRANSFORMER: {
    description: 'AI-powered menu translation and description generation',
    scopes: ['global', 'restaurant', 'plan'],
    defaultValue: false,
    minPlan: 'premium',
  },
  FF_PAYMENTS: {
    description: 'Payment processing and subscription billing',
    scopes: ['global'],
    defaultValue: false,
  },
  FF_POS_LAYER: {
    description: 'POS system integration (iiko, R-Keeper)',
    scopes: ['global', 'restaurant'],
    defaultValue: false,
  },
  FF_AI_ASSISTANT: {
    description: 'AI chat assistant for restaurant guests',
    scopes: ['plan'],
    defaultValue: false,
    minPlan: 'luxe',
  },
  FF_DEEPL_TRANSLATION: {
    description: 'DeepL-powered high-quality translation',
    scopes: ['plan'],
    defaultValue: false,
    minPlan: 'premium',
  },
  FF_CUSTOM_TEMPLATE: {
    description: 'Custom menu template/branding',
    scopes: ['plan'],
    defaultValue: false,
    minPlan: 'premium',
  },
  FF_ANALYTICS: {
    description: 'Analytics dashboard access',
    scopes: ['plan'],
    defaultValue: false,
    minPlan: 'pro',
  },
  FF_NFC_EXTENDED: {
    description: 'Extended NFC tag management (>1 tag)',
    scopes: ['plan'],
    defaultValue: false,
    minPlan: 'pro',
  },
}

// ─── Plan Hierarchy ───────────────────────────────────────────────────────────

const PLAN_ORDER: Record<SubscriptionPlan, number> = {
  starter: 0,
  pro: 1,
  premium: 2,
  luxe: 3,
}

function planMeetsMinimum(
  current: SubscriptionPlan,
  minimum: SubscriptionPlan
): boolean {
  return PLAN_ORDER[current] >= PLAN_ORDER[minimum]
}

// ─── Evaluation Context ───────────────────────────────────────────────────────

export interface FlagContext {
  /** Current user's subscription plan */
  plan?: SubscriptionPlan
  /** Current user's role */
  role?: UserRole
  /** Restaurant ID (for restaurant-scoped flags) */
  restaurantId?: string
}

// ─── Runtime Overrides ────────────────────────────────────────────────────────
// In-memory overrides for testing and gradual rollout.
// Phase 02+ will move this to DB / remote config.

const runtimeOverrides: Partial<Record<FeatureFlag, boolean>> = {}

/**
 * Override a flag value at runtime (server-side only).
 * Useful for tests, admin toggles, and gradual rollout.
 */
export function setFlagOverride(flag: FeatureFlag, value: boolean): void {
  runtimeOverrides[flag] = value
}

/**
 * Clear a runtime override, reverting to default logic.
 */
export function clearFlagOverride(flag: FeatureFlag): void {
  delete runtimeOverrides[flag]
}

/**
 * Clear all runtime overrides.
 */
export function clearAllOverrides(): void {
  for (const key of Object.keys(runtimeOverrides)) {
    delete runtimeOverrides[key as FeatureFlag]
  }
}

// ─── Environment Overrides ────────────────────────────────────────────────────
// Env vars like FF_GUEST_ORDERING=true override defaults.

function getEnvOverride(flag: FeatureFlag): boolean | undefined {
  const envValue = process.env[flag]
  if (envValue === 'true' || envValue === '1') return true
  if (envValue === 'false' || envValue === '0') return false
  return undefined
}

// ─── Main Evaluation Function ─────────────────────────────────────────────────

/**
 * Check if a feature flag is enabled, considering all scopes.
 *
 * Resolution order:
 * 1. Runtime overrides (highest priority — testing/admin)
 * 2. Environment variable overrides (deployment config)
 * 3. Plan-based gate (if scope includes 'plan' and context has plan)
 * 4. Role-based gate (if scope includes 'role' and context has role)
 * 5. Default value from registry
 */
export function isFeatureEnabled(
  flag: FeatureFlag,
  context: FlagContext = {}
): boolean {
  const definition = FLAG_REGISTRY[flag]
  if (!definition) {
    console.warn(`[feature-flags] Unknown flag: ${flag}`)
    return false
  }

  // 1. Runtime override
  if (flag in runtimeOverrides) {
    return runtimeOverrides[flag]!
  }

  // 2. Environment variable
  const envOverride = getEnvOverride(flag)
  if (envOverride !== undefined) {
    return envOverride
  }

  // 3. Plan-based gate
  if (
    definition.scopes.includes('plan') &&
    definition.minPlan &&
    context.plan
  ) {
    if (!planMeetsMinimum(context.plan, definition.minPlan)) {
      return false
    }
    // Plan meets minimum — continue to check default
    return true
  }

  // 4. Role-based gate
  if (
    definition.scopes.includes('role') &&
    definition.allowedRoles &&
    context.role
  ) {
    return definition.allowedRoles.includes(context.role)
  }

  // 5. Default
  return definition.defaultValue
}

// ─── Helper: Get All Flags Status ─────────────────────────────────────────────

/**
 * Returns the current state of all feature flags for a given context.
 * Useful for debugging and admin panels.
 */
export function getAllFlagsStatus(
  context: FlagContext = {}
): Record<FeatureFlag, boolean> {
  const result = {} as Record<FeatureFlag, boolean>
  for (const flag of Object.keys(FLAG_REGISTRY) as FeatureFlag[]) {
    result[flag] = isFeatureEnabled(flag, context)
  }
  return result
}

/**
 * Returns a serializable summary of all flags for client-side hydration.
 * Does NOT include runtime overrides for security.
 */
export function getFlagsForClient(
  context: FlagContext = {}
): Record<FeatureFlag, boolean> {
  return getAllFlagsStatus(context)
}
