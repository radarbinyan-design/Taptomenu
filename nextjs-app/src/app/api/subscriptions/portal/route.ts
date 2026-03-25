/**
 * POST /api/subscriptions/portal
 *
 * Creates a Stripe Customer Portal session for managing subscription
 * (update payment method, change plan, view invoices, cancel).
 *
 * Phase 04: Payments
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { isStripeConfigured, createPortalSession } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ||
      request.cookies.get('user-id')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({
        error: 'No Stripe customer found. Please subscribe first.',
      }, { status: 400 })
    }

    if (!isStripeConfigured()) {
      return NextResponse.json({
        error: 'Stripe is not configured. Billing portal unavailable in demo mode.',
      }, { status: 503 })
    }

    const session = await createPortalSession(subscription.stripeCustomerId)

    logger.info('[api/subscriptions/portal] Portal session created', {
      userId,
      customerId: subscription.stripeCustomerId,
    })

    return NextResponse.json({ portalUrl: session.url })
  } catch (err) {
    logger.error('[api/subscriptions/portal] Failed', { error: String(err) })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
