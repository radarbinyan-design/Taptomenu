/**
 * TapMenu Armenia — Plan Enforcement Middleware
 *
 * Server-side utility to check plan limits before allowing CRUD operations.
 * Used in API routes to enforce subscription quotas.
 *
 * Phase 04: Payments
 *
 * Usage:
 *   import { enforcePlanLimit, checkSubscriptionStatus } from '@/lib/plan-enforcement'
 *
 *   // In API route:
 *   const check = await enforcePlanLimit(userId, 'menus')
 *   if (!check.allowed) return NextResponse.json({ error: check.error }, { status: 403 })
 */

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import type { SubscriptionPlan, SubscriptionStatus } from '@/types'

// ─── Limit types ──────────────────────────────────────────────────────────────

export type LimitResource = 'menus' | 'dishes' | 'languages' | 'nfcTags'

interface EnforcementResult {
  allowed: boolean
  error?: string
  current?: number
  max?: number
  plan?: SubscriptionPlan
  status?: SubscriptionStatus
}

// ─── Check subscription status ────────────────────────────────────────────────

export async function checkSubscriptionStatus(
  userId: string
): Promise<{
  valid: boolean
  status: SubscriptionStatus | null
  plan: SubscriptionPlan | null
  error?: string
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return { valid: false, status: null, plan: null, error: 'No subscription found' }
  }

  // Blocked subscriptions cannot perform any operations
  if (subscription.status === 'blocked') {
    return {
      valid: false,
      status: subscription.status,
      plan: subscription.plan,
      error: 'Subscription is blocked. Please update your payment method.',
    }
  }

  // Cancelled subscriptions are read-only
  if (subscription.status === 'cancelled') {
    return {
      valid: false,
      status: subscription.status,
      plan: subscription.plan,
      error: 'Subscription is cancelled. Please resubscribe to make changes.',
    }
  }

  // Grace period — allow operations but warn
  if (subscription.status === 'grace') {
    if (subscription.graceEndsAt && subscription.graceEndsAt < new Date()) {
      // Grace period expired → block
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'blocked' },
      })
      return {
        valid: false,
        status: 'blocked',
        plan: subscription.plan,
        error: 'Grace period expired. Subscription blocked.',
      }
    }
    // Still in grace — allow but log
    logger.warn('[plan-enforcement] User in grace period', { userId })
  }

  // Trial — check expiry
  if (subscription.status === 'trial') {
    if (subscription.trialEndsAt && subscription.trialEndsAt < new Date()) {
      // Trial expired → block
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'blocked' },
      })
      return {
        valid: false,
        status: 'blocked',
        plan: subscription.plan,
        error: 'Trial has expired. Please subscribe to continue.',
      }
    }
  }

  return { valid: true, status: subscription.status, plan: subscription.plan }
}

// ─── Enforce plan limit for a resource ────────────────────────────────────────

export async function enforcePlanLimit(
  userId: string,
  resource: LimitResource
): Promise<EnforcementResult> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return { allowed: false, error: 'No subscription found' }
  }

  // Check subscription status first
  const statusCheck = await checkSubscriptionStatus(userId)
  if (!statusCheck.valid) {
    return {
      allowed: false,
      error: statusCheck.error,
      plan: subscription.plan,
      status: subscription.status,
    }
  }

  // Get max limit for this resource
  const maxMap: Record<LimitResource, number> = {
    menus: subscription.maxMenus,
    dishes: subscription.maxDishes,
    languages: subscription.maxLanguages,
    nfcTags: subscription.maxNfcTags,
  }

  const max = maxMap[resource]

  // -1 means unlimited
  if (max === -1) {
    return { allowed: true, plan: subscription.plan, status: subscription.status }
  }

  // Get current count
  const restaurant = await prisma.restaurant.findFirst({
    where: { userId },
  })

  if (!restaurant) {
    return { allowed: false, error: 'No restaurant found' }
  }

  let current = 0
  switch (resource) {
    case 'menus':
      current = await prisma.menu.count({
        where: { restaurantId: restaurant.id, status: { not: 'inactive' } },
      })
      break
    case 'dishes':
      current = await prisma.dish.count({
        where: { restaurantId: restaurant.id, status: { not: 'archived' } },
      })
      break
    case 'nfcTags':
      current = await prisma.table.count({
        where: { restaurantId: restaurant.id, nfcTagId: { not: null } },
      })
      break
    case 'languages': {
      // Count unique languages across all active menus
      const menus = await prisma.menu.findMany({
        where: { restaurantId: restaurant.id, status: 'active' },
        select: { languages: true },
      })
      const allLangs = new Set<string>()
      menus.forEach(m => m.languages.forEach(l => allLangs.add(l)))
      current = allLangs.size
      break
    }
  }

  if (current >= max) {
    const resourceLabels: Record<LimitResource, string> = {
      menus: 'menus',
      dishes: 'dishes',
      languages: 'languages',
      nfcTags: 'NFC tags',
    }

    return {
      allowed: false,
      current,
      max,
      plan: subscription.plan,
      status: subscription.status,
      error: `Plan limit reached: ${current}/${max} ${resourceLabels[resource]}. Upgrade your plan.`,
    }
  }

  return {
    allowed: true,
    current,
    max,
    plan: subscription.plan,
    status: subscription.status,
  }
}

// ─── Quick check: is feature available on plan? ──────────────────────────────

const PLAN_ORDER: Record<SubscriptionPlan, number> = {
  starter: 0,
  pro: 1,
  premium: 2,
  luxe: 3,
}

export function isPlanAtLeast(
  currentPlan: SubscriptionPlan,
  requiredPlan: SubscriptionPlan
): boolean {
  return PLAN_ORDER[currentPlan] >= PLAN_ORDER[requiredPlan]
}

// ─── Get usage summary for a user ─────────────────────────────────────────────

export async function getUsageSummary(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) return null

  const restaurant = await prisma.restaurant.findFirst({
    where: { userId },
    include: {
      _count: {
        select: {
          dishes: true,
          menus: true,
          tables: true,
        },
      },
    },
  })

  if (!restaurant) return null

  // Count NFC tags
  const nfcCount = await prisma.table.count({
    where: { restaurantId: restaurant.id, nfcTagId: { not: null } },
  })

  // Count unique languages
  const menus = await prisma.menu.findMany({
    where: { restaurantId: restaurant.id, status: 'active' },
    select: { languages: true },
  })
  const allLangs = new Set<string>()
  menus.forEach(m => m.languages.forEach(l => allLangs.add(l)))

  return {
    menus: { current: restaurant._count.menus, max: subscription.maxMenus },
    dishes: { current: restaurant._count.dishes, max: subscription.maxDishes },
    languages: { current: allLangs.size, max: subscription.maxLanguages },
    nfcTags: { current: nfcCount, max: subscription.maxNfcTags },
  }
}
