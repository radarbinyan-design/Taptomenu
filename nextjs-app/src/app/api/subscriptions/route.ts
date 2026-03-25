/**
 * GET  /api/subscriptions       — Get current user's subscription + payment history
 * POST /api/subscriptions       — (internal) Create subscription for a user
 * PATCH /api/subscriptions      — Cancel / resume subscription
 *
 * Phase 04: Payments
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import {
  isStripeConfigured,
  cancelStripeSubscription,
  resumeStripeSubscription,
} from '@/lib/stripe'

// ─── GET: Fetch subscription + recent transactions ──────────────────────────

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ||
      request.cookies.get('user-id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        paymentTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        paymentHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Calculate days remaining in trial / current period
    let daysRemaining: number | null = null
    if (subscription.status === 'trial' && subscription.trialEndsAt) {
      daysRemaining = Math.max(0, Math.ceil(
        (subscription.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    } else if (subscription.currentPeriodEnd) {
      daysRemaining = Math.max(0, Math.ceil(
        (subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    }

    // Get current usage
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

    const usage = {
      menus: restaurant?._count.menus ?? 0,
      dishes: restaurant?._count.dishes ?? 0,
      tables: restaurant?._count.tables ?? 0,
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        isYearly: subscription.isYearly,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        graceEndsAt: subscription.graceEndsAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        maxMenus: subscription.maxMenus,
        maxDishes: subscription.maxDishes,
        maxLanguages: subscription.maxLanguages,
        maxNfcTags: subscription.maxNfcTags,
        stripeCustomerId: subscription.stripeCustomerId,
        hasStripe: !!subscription.stripeSubscriptionId,
        daysRemaining,
      },
      usage,
      transactions: subscription.paymentTransactions.map(t => ({
        id: t.id,
        type: t.type,
        status: t.status,
        amount: t.amount,
        currency: t.currency,
        plan: t.plan,
        period: t.period,
        description: t.description,
        receiptUrl: t.receiptUrl,
        createdAt: t.createdAt,
      })),
    })
  } catch (err) {
    logger.error('[api/subscriptions] GET failed', { error: String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── PATCH: Cancel or resume subscription ──────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ||
      request.cookies.get('user-id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const action = body.action as 'cancel' | 'resume' | undefined

    if (!action || !['cancel', 'resume'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "cancel" or "resume".' }, { status: 400 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // ─── Stripe-backed subscription ─────────────────────────────────────
    if (subscription.stripeSubscriptionId && isStripeConfigured()) {
      if (action === 'cancel') {
        await cancelStripeSubscription(subscription.stripeSubscriptionId, false)
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { cancelAtPeriodEnd: true },
        })
        logger.info('[api/subscriptions] Cancellation scheduled', {
          subscriptionId: subscription.id,
        })
        return NextResponse.json({
          message: 'Subscription will be cancelled at period end',
          cancelAtPeriodEnd: true,
        })
      } else {
        await resumeStripeSubscription(subscription.stripeSubscriptionId)
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { cancelAtPeriodEnd: false },
        })
        logger.info('[api/subscriptions] Cancellation resumed', {
          subscriptionId: subscription.id,
        })
        return NextResponse.json({
          message: 'Subscription resumed',
          cancelAtPeriodEnd: false,
        })
      }
    }

    // ─── Demo / non-Stripe subscription ─────────────────────────────────
    if (action === 'cancel') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          cancelAtPeriodEnd: true,
          status: subscription.status === 'trial' ? 'cancelled' : subscription.status,
        },
      })
      return NextResponse.json({
        message: 'Subscription cancellation scheduled (demo mode)',
        cancelAtPeriodEnd: true,
      })
    } else {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: false },
      })
      return NextResponse.json({
        message: 'Subscription resumed (demo mode)',
        cancelAtPeriodEnd: false,
      })
    }
  } catch (err) {
    logger.error('[api/subscriptions] PATCH failed', { error: String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
