import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { TableCreateSchema, paginationSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:tables')

// GET /api/tables?restaurantId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const pagination = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
    }

    const [tables, total] = await Promise.all([
      prisma.table.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'asc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.table.count({ where: { restaurantId } }),
    ])

    return NextResponse.json({
      tables,
      total,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit),
    })
  } catch (error) {
    log.error('GET failed', { error })
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}

// POST /api/tables
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = TableCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 })
    }

    // Check NFC tag limit based on subscription
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parsed.data.restaurantId },
      include: {
        user: { include: { subscription: true } },
        _count: { select: { tables: true } },
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const maxTags = restaurant.user?.subscription?.maxNfcTags ?? 1
    if (maxTags !== -1 && restaurant._count.tables >= maxTags) {
      return NextResponse.json(
        { error: `Table limit reached (${maxTags}). Upgrade your plan.` },
        { status: 403 }
      )
    }

    // Generate QR code URL
    const qrCode = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.tapmenu.am'}/menu/${restaurant.slug}?table=${parsed.data.name}`

    const table = await prisma.table.create({
      data: {
        ...parsed.data,
        qrCode,
      },
    })

    log.info('Table created', { id: table.id, restaurantId: table.restaurantId })
    return NextResponse.json({ table }, { status: 201 })
  } catch (error) {
    log.error('POST failed', { error })
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}
