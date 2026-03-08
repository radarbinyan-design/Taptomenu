import { NextRequest, NextResponse } from 'next/server'

/* ─────────────────────────────────────────────────────────────────────────
   In-memory leads store (replace with Prisma/Supabase in production)
   ───────────────────────────────────────────────────────────────────────── */
const leadsStore: Lead[] = []

export interface Lead {
  id: string
  name: string
  restaurantName: string
  email: string
  phone: string
  plan: string
  message: string
  createdAt: string
  status: 'new' | 'contacted' | 'converted' | 'rejected'
  source: string
}

/* ─── Validation ──────────────────────────────────────────────────────────── */
function validateLead(data: Partial<Lead>): string | null {
  if (!data.name || data.name.trim().length < 2) return 'Укажите ваше имя (минимум 2 символа)'
  if (!data.email || data.email.trim().length < 3) return 'Укажите email или телефон'
  return null
}

/* ─── Rate limiting (simple in-memory) ───────────────────────────────────── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }) // 1 min window
    return true
  }

  if (entry.count >= 5) return false // max 5 per minute

  entry.count++
  return true
}

/* ─── POST /api/leads ─────────────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    // Rate limit check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте через минуту.' },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validate
    const validationError = validateLead(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Sanitise inputs
    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: String(body.name ?? '').slice(0, 100).trim(),
      restaurantName: String(body.restaurantName ?? '').slice(0, 200).trim(),
      email: String(body.email ?? '').slice(0, 200).trim(),
      phone: String(body.phone ?? '').slice(0, 30).trim(),
      plan: ['starter', 'pro', 'premium', 'luxe'].includes(body.plan) ? body.plan : 'pro',
      message: String(body.message ?? '').slice(0, 2000).trim(),
      createdAt: new Date().toISOString(),
      status: 'new',
      source: request.headers.get('referer') ?? 'direct',
    }

    // Save to store
    leadsStore.push(lead)

    // Log for debugging (replace with real DB insert / Resend email in production)
    console.log(`[leads] New lead #${leadsStore.length}:`, {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      plan: lead.plan,
      restaurantName: lead.restaurantName,
    })

    // TODO (production): send email notification via Resend
    // await sendLeadNotification(lead)

    // TODO (production): save to Supabase/Prisma
    // await prisma.lead.create({ data: lead })

    return NextResponse.json(
      {
        success: true,
        message: 'Заявка принята! Мы свяжемся с вами в течение 24 часов.',
        leadId: lead.id,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[leads] POST error:', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера. Попробуйте позже.' },
      { status: 500 }
    )
  }
}

/* ─── GET /api/leads (admin only — TODO: add auth check) ─────────────────── */
export async function GET(request: NextRequest) {
  // TODO: check admin role from JWT before returning data
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  const filtered = status ? leadsStore.filter((l) => l.status === status) : leadsStore

  return NextResponse.json({
    leads: filtered.slice(-limit).reverse(), // newest first
    total: filtered.length,
  })
}
