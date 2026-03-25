/**
 * POST /api/webhooks/stripe
 *
 * Stripe webhook handler for subscription lifecycle events.
 * Processes: checkout.session.completed, invoice.paid, invoice.payment_failed,
 * customer.subscription.updated, customer.subscription.deleted
 *
 * Phase 04: Payments
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import {
  constructWebhookEvent,
  isStripeConfigured,
  planFromPriceId,
  isYearlyFromPriceId,
  PLAN_LIMITS_MAP,
} from '@/lib/stripe'
import type { SubscriptionPlan, SubscriptionStatus } from '@/types'

// Disable body parsing — Stripe needs raw body
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    logger.warn('[webhook/stripe] Stripe not configured, rejecting webhook')
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event
  try {
    const body = await request.text()
    event = await constructWebhookEvent(body, signature)
  } catch (err) {
    logger.error('[webhook/stripe] Signature verification failed', { error: String(err) })
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  logger.info('[webhook/stripe] Received event', { type: event.type, id: event.id })

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      default:
        logger.info('[webhook/stripe] Unhandled event type', { type: event.type })
    }
  } catch (err) {
    logger.error('[webhook/stripe] Event processing failed', {
      type: event.type,
      error: String(err),
    })
    // Return 200 to prevent Stripe retries on app-level errors
    return NextResponse.json({ received: true, error: 'Processing error' })
  }

  return NextResponse.json({ received: true })
}

// ─── Handler: Checkout Session Completed ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.userId
  const planName = session.metadata?.plan as SubscriptionPlan | undefined
  const stripeCustomerId = session.customer as string
  const stripeSubscriptionId = session.subscription as string

  if (!userId || !planName) {
    logger.warn('[webhook/stripe] checkout.session.completed missing metadata', {
      sessionId: session.id,
    })
    return
  }

  const limits = PLAN_LIMITS_MAP[planName] || PLAN_LIMITS_MAP.starter

  // Find subscription for user
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    logger.error('[webhook/stripe] No subscription found for user', { userId })
    return
  }

  // Update subscription with Stripe IDs and activate
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      stripeCustomerId,
      stripeSubscriptionId,
      plan: planName,
      status: 'active',
      isYearly: session.metadata?.isYearly === '1',
      maxMenus: limits.maxMenus,
      maxDishes: limits.maxDishes,
      maxLanguages: limits.maxLanguages,
      maxNfcTags: limits.maxNfcTags,
      trialEndsAt: null, // Trial ended
      graceEndsAt: null,
    },
  })

  // Record transaction
  await prisma.paymentTransaction.create({
    data: {
      subscriptionId: subscription.id,
      stripePaymentIntentId: session.payment_intent || null,
      type: 'subscription_create',
      status: 'succeeded',
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      plan: planName,
      period: session.metadata?.isYearly === '1' ? 'yearly' : 'monthly',
      description: `Subscription created: ${planName} plan`,
      metadata: { sessionId: session.id },
    },
  })

  logger.info('[webhook/stripe] Checkout completed — subscription activated', {
    userId,
    plan: planName,
    subscriptionId: subscription.id,
  })
}

// ─── Handler: Invoice Paid (renewal) ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoicePaid(invoice: any) {
  const stripeSubscriptionId = invoice.subscription as string
  if (!stripeSubscriptionId) return

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  })

  if (!subscription) {
    logger.warn('[webhook/stripe] invoice.paid — no subscription found', {
      stripeSubscriptionId,
    })
    return
  }

  // Determine plan from price ID
  const priceId = invoice.lines?.data?.[0]?.price?.id
  const plan = priceId ? planFromPriceId(priceId) : null
  const isYearly = priceId ? isYearlyFromPriceId(priceId) : subscription.isYearly
  const currentPlan = plan || subscription.plan

  // Update subscription period
  const periodEnd = invoice.lines?.data?.[0]?.period?.end
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'active',
      plan: currentPlan,
      isYearly,
      stripePriceId: priceId || subscription.stripePriceId,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
      graceEndsAt: null,
      cancelAtPeriodEnd: false,
    },
  })

  // Record transaction
  await prisma.paymentTransaction.create({
    data: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: invoice.payment_intent || null,
      type: 'subscription_renew',
      status: 'succeeded',
      amount: invoice.amount_paid || 0,
      currency: invoice.currency || 'usd',
      plan: currentPlan,
      period: isYearly ? 'yearly' : 'monthly',
      description: `Invoice paid: ${currentPlan} plan renewal`,
      receiptUrl: invoice.hosted_invoice_url || null,
      metadata: { invoiceId: invoice.id },
    },
  })

  logger.info('[webhook/stripe] Invoice paid — subscription renewed', {
    subscriptionId: subscription.id,
    plan: currentPlan,
    amount: invoice.amount_paid,
  })
}

// ─── Handler: Invoice Payment Failed ────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleInvoiceFailed(invoice: any) {
  const stripeSubscriptionId = invoice.subscription as string
  if (!stripeSubscriptionId) return

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  })

  if (!subscription) return

  // Move to grace period (7 days)
  const graceEnd = new Date()
  graceEnd.setDate(graceEnd.getDate() + 7)

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'grace' as SubscriptionStatus,
      graceEndsAt: graceEnd,
    },
  })

  // Record failed transaction
  await prisma.paymentTransaction.create({
    data: {
      subscriptionId: subscription.id,
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: invoice.payment_intent || null,
      type: 'subscription_renew',
      status: 'failed',
      amount: invoice.amount_due || 0,
      currency: invoice.currency || 'usd',
      plan: subscription.plan,
      period: subscription.isYearly ? 'yearly' : 'monthly',
      description: `Payment failed for ${subscription.plan} plan`,
      failureReason: invoice.last_finalization_error?.message || 'Payment failed',
      metadata: { invoiceId: invoice.id, attemptCount: invoice.attempt_count },
    },
  })

  logger.warn('[webhook/stripe] Invoice payment failed — entered grace period', {
    subscriptionId: subscription.id,
    graceEndsAt: graceEnd.toISOString(),
  })
}

// ─── Handler: Subscription Updated (plan change, cancellation) ──────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdated(stripeSub: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSub.id },
  })

  if (!subscription) return

  const priceId = stripeSub.items?.data?.[0]?.price?.id
  const newPlan = priceId ? planFromPriceId(priceId) : null
  const isYearly = priceId ? isYearlyFromPriceId(priceId) : subscription.isYearly

  const updateData: Record<string, unknown> = {
    cancelAtPeriodEnd: stripeSub.cancel_at_period_end ?? false,
    stripePriceId: priceId || subscription.stripePriceId,
  }

  // Map Stripe status to our status
  if (stripeSub.status === 'active') {
    updateData.status = 'active'
    updateData.graceEndsAt = null
  } else if (stripeSub.status === 'past_due') {
    updateData.status = 'grace'
  } else if (stripeSub.status === 'canceled' || stripeSub.status === 'unpaid') {
    updateData.status = 'blocked'
  }

  // Plan change
  if (newPlan && newPlan !== subscription.plan) {
    const limits = PLAN_LIMITS_MAP[newPlan]
    updateData.plan = newPlan
    updateData.isYearly = isYearly
    updateData.maxMenus = limits.maxMenus
    updateData.maxDishes = limits.maxDishes
    updateData.maxLanguages = limits.maxLanguages
    updateData.maxNfcTags = limits.maxNfcTags

    // Log the upgrade/downgrade
    logger.info('[webhook/stripe] Plan changed', {
      subscriptionId: subscription.id,
      from: subscription.plan,
      to: newPlan,
    })
  }

  // Period end
  if (stripeSub.current_period_end) {
    updateData.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000)
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: updateData,
  })
}

// ─── Handler: Subscription Deleted ──────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(stripeSub: any) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSub.id },
  })

  if (!subscription) return

  // Downgrade to starter limits
  const starterLimits = PLAN_LIMITS_MAP.starter

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'cancelled',
      plan: 'starter',
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: null,
      stripePriceId: null,
      maxMenus: starterLimits.maxMenus,
      maxDishes: starterLimits.maxDishes,
      maxLanguages: starterLimits.maxLanguages,
      maxNfcTags: starterLimits.maxNfcTags,
    },
  })

  logger.info('[webhook/stripe] Subscription deleted — downgraded to starter', {
    subscriptionId: subscription.id,
    userId: subscription.userId,
  })
}
