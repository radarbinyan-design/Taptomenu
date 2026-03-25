import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { MenuViewCreateSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:menu-views')

// POST /api/menu-views — Track a menu view (called from public menu page)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = MenuViewCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    // Detect device from User-Agent
    const ua = request.headers.get('user-agent') || ''
    let device = parsed.data.device
    if (!device) {
      if (/mobile/i.test(ua)) device = 'mobile'
      else if (/tablet|ipad/i.test(ua)) device = 'tablet'
      else device = 'desktop'
    }

    // Detect country/city from headers (Vercel/Cloudflare provide these)
    const country = request.headers.get('x-vercel-ip-country') ||
                    request.headers.get('cf-ipcountry') || undefined
    const city = request.headers.get('x-vercel-ip-city') ||
                 request.headers.get('cf-ipcity') || undefined

    const menuView = await prisma.menuView.create({
      data: {
        restaurantId: parsed.data.restaurantId,
        tableId: parsed.data.tableId || null,
        lang: parsed.data.lang,
        device,
        country: country || null,
        city: city || null,
      },
    })

    return NextResponse.json({ id: menuView.id }, { status: 201 })
  } catch (error) {
    // Menu view tracking should never break the user experience
    log.warn('Menu view tracking failed (non-critical)', { error })
    return NextResponse.json({ id: null }, { status: 201 })
  }
}

// GET /api/menu-views?restaurantId=xxx&days=30 — Analytics summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
    }

    const since = new Date()
    since.setDate(since.getDate() - days)

    const [totalViews, viewsByLang, viewsByDevice, viewsByDay] = await Promise.all([
      // Total views
      prisma.menuView.count({
        where: { restaurantId, viewedAt: { gte: since } },
      }),

      // Views by language
      prisma.menuView.groupBy({
        by: ['lang'],
        where: { restaurantId, viewedAt: { gte: since } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      // Views by device
      prisma.menuView.groupBy({
        by: ['device'],
        where: { restaurantId, viewedAt: { gte: since } },
        _count: { id: true },
      }),

      // Views per day (last N days)
      prisma.$queryRaw`
        SELECT
          DATE(viewed_at) as date,
          COUNT(*)::int as count
        FROM menu_views
        WHERE restaurant_id = ${restaurantId}::uuid
          AND viewed_at >= ${since}
        GROUP BY DATE(viewed_at)
        ORDER BY date ASC
      ` as Promise<Array<{ date: string; count: number }>>,
    ])

    return NextResponse.json({
      totalViews,
      viewsByLang: viewsByLang.map((v) => ({ lang: v.lang, count: v._count.id })),
      viewsByDevice: viewsByDevice.map((v) => ({ device: v.device, count: v._count.id })),
      viewsByDay,
      period: { days, since: since.toISOString() },
    })
  } catch (error) {
    log.error('GET analytics failed', { error })
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
