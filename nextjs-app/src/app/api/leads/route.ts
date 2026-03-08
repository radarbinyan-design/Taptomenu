import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase'

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface LeadBody {
  name: string
  restaurantName?: string
  email: string
  phone?: string
  plan?: string
  message?: string
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
/** Escape HTML to prevent XSS in email body */
function escHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/** Check if Resend API key looks real */
function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY ?? ''
  return key.startsWith('re_') && key.length > 10
}

/** Simple in-memory fallback store (works without Supabase) */
const memoryLeads: Record<string, unknown>[] = []

/* ─── Rate limiting ──────────────────────────────────────────────────────── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

/* ─── POST /api/leads ────────────────────────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    /* ── Rate limit ──────────────────────────────────────────────────────── */
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте через минуту.' },
        { status: 429 }
      )
    }

    /* ── Parse body ──────────────────────────────────────────────────────── */
    const body: LeadBody = await request.json()

    /* ── Validate ────────────────────────────────────────────────────────── */
    if (!body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: 'Имя и email обязательны' },
        { status: 400 }
      )
    }

    /* ── Sanitise ────────────────────────────────────────────────────────── */
    const validPlans = ['starter', 'pro', 'premium', 'luxe']
    const lead = {
      name: String(body.name).slice(0, 100).trim(),
      restaurant_name: String(body.restaurantName ?? '').slice(0, 200).trim() || null,
      email: String(body.email).slice(0, 200).trim().toLowerCase(),
      phone: String(body.phone ?? '').slice(0, 30).trim() || null,
      plan: validPlans.includes(body.plan ?? '') ? body.plan! : 'pro',
      message: String(body.message ?? '').slice(0, 2000).trim() || null,
      status: 'new' as const,
    }

    let savedId: string | null = null

    /* ── Save to Supabase using admin client (bypasses RLS) ─────────────── */
    if (isSupabaseConfigured()) {
      // Cast to any to avoid strict Database type mismatch (plan is string, not enum)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabaseAdmin as any)
        .from('leads')
        .insert(lead)
        .select('id')
        .single()

      if (error) {
        console.error('[leads] Supabase insert error:', error.message, error.code)
        // Fall through to memory store
      } else {
        savedId = data?.id ?? null
        console.log('[leads] ✅ Saved to Supabase, id:', savedId)
      }
    }

    /* ── Fallback: in-memory store ───────────────────────────────────────── */
    if (!savedId) {
      const memLead = {
        ...lead,
        id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        created_at: new Date().toISOString(),
      }
      memoryLeads.push(memLead)
      savedId = memLead.id
      console.log('[leads] ℹ️  Supabase unavailable — saved to memory store, id:', savedId)
    }

    /* ── Send email via Resend (if configured) ───────────────────────────── */
    if (isResendConfigured()) {
      try {
        const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@tapmenu.am'
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tapmenu.am'
        const createdAt = new Date().toISOString()

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'TapMenu <noreply@tapmenu.am>',
            to: adminEmail,
            subject: `🔔 Новая заявка: ${lead.name} — ${lead.plan.toUpperCase()}`,
            html: buildEmailHtml({ ...lead, restaurant_name: lead.restaurant_name ?? '', phone: lead.phone ?? '', message: lead.message ?? '', created_at: createdAt }, appUrl),
          }),
        })

        if (!emailRes.ok) {
          const errBody = await emailRes.text()
          console.error('[leads] Resend error:', emailRes.status, errBody)
        } else {
          console.log('[leads] ✅ Email sent via Resend to:', adminEmail)
        }
      } catch (emailErr) {
        // Non-fatal — lead is still saved
        console.error('[leads] Resend exception:', emailErr)
      }
    } else {
      console.log('[leads] ℹ️  Resend not configured — skipping email notification')
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Заявка принята! Мы свяжемся с вами в течение 24 часов.',
        data: { id: savedId },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[leads] Unhandled error:', err)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}

/* ─── GET /api/leads (admin listing) ────────────────────────────────────── */
export async function GET(request: NextRequest) {
  /* ── Auth check: only admin/superadmin ───────────────────────────────── */
  const userRole = request.cookies.get('user-role')?.value
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  /* ── Supabase query using admin client ───────────────────────────────── */
  if (isSupabaseConfigured()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabaseAdmin as any)
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ leads: data ?? [], total: count ?? 0 })
  }

  /* ── Memory fallback ─────────────────────────────────────────────────── */
  const filtered = status
    ? memoryLeads.filter((l) => l.status === status)
    : memoryLeads

  return NextResponse.json({
    leads: filtered.slice(-limit).reverse(),
    total: filtered.length,
    note: 'memory-store (Supabase not configured)',
  })
}

/* ─── PATCH /api/leads (update status) ──────────────────────────────────── */
export async function PATCH(request: NextRequest) {
  const userRole = request.cookies.get('user-role')?.value
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, status } = await request.json()
  const validStatuses = ['new', 'contacted', 'converted', 'rejected']

  if (!id || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 })
  }

  if (isSupabaseConfigured()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  }

  // Memory fallback
  const lead = memoryLeads.find((l) => l.id === id)
  if (lead) lead.status = status
  return NextResponse.json({ success: true, data: { id, status } })
}

/* ─── Email HTML builder ─────────────────────────────────────────────────── */
function buildEmailHtml(
  lead: {
    name: string
    restaurant_name: string
    email: string
    phone: string
    plan: string
    message: string
    created_at: string
  },
  appUrl: string
): string {
  const planLabels: Record<string, string> = {
    starter: 'Starter ($15/мес)',
    pro: 'Pro ($25/мес)',
    premium: 'Premium ($45/мес)',
    luxe: 'LUXE ($50+/мес)',
  }

  return `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:560px;margin:32px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:28px 32px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div style="background:rgba(255,255,255,0.2);width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:14px">TM</div>
        <span style="color:white;font-weight:700;font-size:18px">TapMenu Armenia</span>
      </div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:700">🔔 Новая заявка с сайта</h1>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px">
      <table style="width:100%;border-collapse:collapse">
        ${[
          ['👤 Имя', escHtml(lead.name)],
          ['🏪 Ресторан', escHtml(lead.restaurant_name) || '<span style="color:#64748b">Не указано</span>'],
          ['📧 Email', `<a href="mailto:${escHtml(lead.email)}" style="color:#f97316">${escHtml(lead.email)}</a>`],
          ['📞 Телефон', lead.phone ? escHtml(lead.phone) : '<span style="color:#64748b">Не указан</span>'],
          ['💰 Тариф', `<strong style="color:#f97316">${escHtml(planLabels[lead.plan] ?? lead.plan)}</strong>`],
          ['📅 Дата', escHtml(new Date(lead.created_at).toLocaleString('ru-RU', { timeZone: 'Asia/Yerevan' }))],
        ]
          .map(
            ([label, val]) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #334155;color:#94a3b8;font-size:13px;width:150px;vertical-align:top">${label}</td>
            <td style="padding:10px 0;border-bottom:1px solid #334155;color:#f1f5f9;font-size:14px">${val}</td>
          </tr>`
          )
          .join('')}
      </table>

      ${
        lead.message
          ? `
      <div style="margin-top:20px;background:#0f172a;border-radius:10px;padding:16px;border:1px solid #334155">
        <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.05em">Сообщение</p>
        <p style="color:#e2e8f0;font-size:14px;line-height:1.6;margin:0">${escHtml(lead.message)}</p>
      </div>`
          : ''
      }

      <div style="margin-top:24px;text-align:center">
        <a href="${escHtml(appUrl)}/admin/leads"
           style="display:inline-block;background:#f97316;color:white;padding:14px 28px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px">
          Открыть в админ-панели →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #334155;text-align:center">
      <p style="color:#475569;font-size:12px;margin:0">TapMenu Armenia · Ереван · <a href="mailto:hello@tapmenu.am" style="color:#f97316">hello@tapmenu.am</a></p>
    </div>
  </div>
</body>
</html>`
}
