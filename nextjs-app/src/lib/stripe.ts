/**
 * TapMenu Armenia — Stripe Integration
 *
 * Provides Stripe SDK initialization, helpers for creating checkout sessions,
 * customer portals, and managing subscription lifecycle.
 *
 * Phase 04: Payment processing and subscription billing.
 *
 * Environment variables:
 *   STRIPE_SECRET_KEY        — Stripe secret API key
 *   STRIPE_WEBHOOK_SECRET    — Stripe webhook signing secret
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Public key (client-side)
 *   NEXT_PUBLIC_APP_URL      — Base URL for redirects (e.g. https://app.tapmenu.am)
 */

import { logger } from '@/lib/logger'
import type { SubscriptionPlan } from '@/types'

// ─── Lazy Stripe init (server-side only) ──────────────────────────────────────

let stripeInstance: import('stripe').default | null = null

export function getStripe(): import('stripe').default {
  if (stripeInstance) return stripeInstance

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('[stripe] STRIPE_SECRET_KEY is not set')
  }

  // Dynamic import to avoid bundling Stripe on the client
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe').default || require('stripe')
  stripeInstance = new Stripe(key, {
    apiVersion: '2024-12-18.acacia' as string,
    typescript: true,
    appInfo: {
      name: 'TapMenu Armenia',
      version: '0.4.0',
    },
  })
  return stripeInstance!
}

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
}

// ─── Stripe Price IDs per plan ────────────────────────────────────────────────
// These are configured in Stripe Dashboard → Products → Prices
// In demo mode, we use mock IDs.

export interface StripePriceConfig {
  monthly: string
  yearly: string
}

const STRIPE_PRICES: Record<SubscriptionPlan, StripePriceConfig> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || 'price_starter_yearly',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
    yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_yearly',
  },
  luxe: {
    monthly: process.env.STRIPE_PRICE_LUXE_MONTHLY || 'price_luxe_monthly',
    yearly: process.env.STRIPE_PRICE_LUXE_YEARLY || 'price_luxe_yearly',
  },
}

export function getStripePriceId(plan: SubscriptionPlan, isYearly: boolean): string {
  return isYearly ? STRIPE_PRICES[plan].yearly : STRIPE_PRICES[plan].monthly
}

// ─── Plan mapping from Stripe price ID → SubscriptionPlan ─────────────────────

export function planFromPriceId(priceId: string): SubscriptionPlan | null {
  for (const [plan, prices] of Object.entries(STRIPE_PRICES)) {
    if (prices.monthly === priceId || prices.yearly === priceId) {
      return plan as SubscriptionPlan
    }
  }
  return null
}

export function isYearlyFromPriceId(priceId: string): boolean {
  for (const prices of Object.values(STRIPE_PRICES)) {
    if (prices.yearly === priceId) return true
  }
  return false
}

// ─── PLAN_LIMITS for subscription enforcement ─────────────────────────────────

export const PLAN_LIMITS_MAP: Record<SubscriptionPlan, {
  maxMenus: number
  maxDishes: number
  maxLanguages: number
  maxNfcTags: number
}> = {
  starter: { maxMenus: 1, maxDishes: 30, maxLanguages: 2, maxNfcTags: 1 },
  pro: { maxMenus: 3, maxDishes: 100, maxLanguages: 5, maxNfcTags: 5 },
  premium: { maxMenus: 10, maxDishes: 500, maxLanguages: 20, maxNfcTags: 20 },
  luxe: { maxMenus: -1, maxDishes: -1, maxLanguages: 33, maxNfcTags: -1 },
}

// ─── Create Checkout Session ──────────────────────────────────────────────────

export interface CreateCheckoutParams {
  customerId?: string
  customerEmail: string
  plan: SubscriptionPlan
  isYearly: boolean
  userId: string
  successUrl?: string
  cancelUrl?: string
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const priceId = getStripePriceId(params.plan, params.isYearly)

  const sessionParams: Record<string, unknown> = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: params.successUrl || `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=1`,
    cancel_url: params.cancelUrl || `${appUrl}/dashboard/billing?cancelled=1`,
    metadata: {
      userId: params.userId,
      plan: params.plan,
      isYearly: params.isYearly ? '1' : '0',
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
        plan: params.plan,
      },
    },
    allow_promotion_codes: true,
  }

  // Attach to existing Stripe customer or create new one via email
  if (params.customerId) {
    sessionParams.customer = params.customerId
  } else {
    sessionParams.customer_email = params.customerEmail
  }

  logger.info('[stripe] Creating checkout session', {
    plan: params.plan,
    isYearly: params.isYearly,
    userId: params.userId,
  })

  const session = await stripe.checkout.sessions.create(sessionParams as never)
  return session
}

// ─── Create Customer Portal Session ────────────────────────────────────────────

export async function createPortalSession(customerId: string, returnUrl?: string) {
  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${appUrl}/dashboard/billing`,
  })

  return session
}

// ─── Create or get Stripe customer ─────────────────────────────────────────────

export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  metadata: Record<string, string> = {}
): Promise<string> {
  const stripe = getStripe()

  // Search for existing customer by email
  const existing = await stripe.customers.list({ email, limit: 1 })
  if (existing.data.length > 0) {
    return existing.data[0].id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  })

  logger.info('[stripe] Created customer', { customerId: customer.id, email })
  return customer.id
}

// ─── Cancel subscription ─────────────────────────────────────────────────────

export async function cancelStripeSubscription(
  subscriptionId: string,
  immediately = false
) {
  const stripe = getStripe()

  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId)
  }

  // Cancel at period end (grace period)
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

// ─── Resume cancelled subscription ────────────────────────────────────────────

export async function resumeStripeSubscription(subscriptionId: string) {
  const stripe = getStripe()
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

// ─── Retrieve subscription ────────────────────────────────────────────────────

export async function getStripeSubscription(subscriptionId: string) {
  const stripe = getStripe()
  return stripe.subscriptions.retrieve(subscriptionId)
}

// ─── Construct webhook event ──────────────────────────────────────────────────

export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<import('stripe').default.Event> {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET!
  return stripe.webhooks.constructEvent(body, signature, secret)
}
