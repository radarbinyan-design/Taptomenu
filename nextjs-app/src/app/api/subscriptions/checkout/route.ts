/**
 * POST /api/subscriptions/checkout
 *
 * Creates a Stripe Checkout session for plan purchase/upgrade.
 * Returns the checkout URL for client-side redirect.
 *
 * Phase 04: Payments
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import {
  isStripeConfigured,
  createCheckoutSession,
  getOrCreateStripeCustomer,
} from '@/lib/stripe'
import { PLAN_LIMITS } from '@/types'
import type { SubscriptionPlan } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ||
      request.cookies.get('user-id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const plan = body.plan as SubscriptionPlan
    const isYearly = body.isYearly === true

    // Validate plan
    if (!plan || !PLAN_LIMITS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user and subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent downgrade via checkout (should use portal)
    if (user.subscription && user.subscription.plan === plan) {
      return NextResponse.json({
        error: 'Already on this plan. Use the billing portal to manage your subscription.',
      }, { status: 400 })
    }

    // ─── Stripe mode ─────────────────────────────────────────────────────
    if (isStripeConfigured()) {
      // Get or create Stripe customer
      const stripeCustomerId = user.subscription?.stripeCustomerId ||
        await getOrCreateStripeCustomer(user.email, user.name, {
          userId: user.id,
        })

      // Update subscription with customer ID if not set
      if (user.subscription && !user.subscription.stripeCustomerId) {
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: { stripeCustomerId },
        })
      }

      const session = await createCheckoutSession({
        customerId: stripeCustomerId,
        customerEmail: user.email,
        plan,
        isYearly,
        userId: user.id,
      })

      logger.info('[api/subscriptions/checkout] Checkout session created', {
        userId: user.id,
        plan,
        isYearly,
        sessionId: session.id,
      })

      return NextResponse.json({
        checkoutUrl: session.url,
        sessionId: session.id,
      })
    }

    // ─── Demo mode (no Stripe) ──────────────────────────────────────────
    // Simulate plan change immediately
    const limits = PLAN_LIMITS[plan]
    if (user.subscription) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          plan,
          status: 'active',
          isYearly,
          maxMenus: limits.maxMenus,
          maxDishes: limits.maxDishes,
          maxLanguages: limits.maxLanguages,
          maxNfcTags: limits.maxNfcTags,
          trialEndsAt: null,
          currentPeriodEnd: new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000),
        },
      })

      // Record demo transaction
      const priceUsd = isYearly ? limits.priceYearly : limits.priceMonthly
      await prisma.paymentTransaction.create({
        data: {
          subscriptionId: user.subscription.id,
          type: 'subscription_create',
          status: 'succeeded',
          amount: priceUsd * 100, // cents
          currency: 'usd',
          plan,
          period: isYearly ? 'yearly' : 'monthly',
          description: `Demo: ${plan} plan activated`,
        },
      })
    }

    logger.info('[api/subscriptions/checkout] Demo plan activated', {
      userId: user.id,
      plan,
      isYearly,
    })

    return NextResponse.json({
      checkoutUrl: null, // No redirect needed
      demo: true,
      message: `Plan changed to ${plan} (demo mode)`,
    })
  } catch (err) {
    logger.error('[api/subscriptions/checkout] Failed', { error: String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
