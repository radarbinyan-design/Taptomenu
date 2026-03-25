import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { RestaurantCreateSchema, paginationSchema, formatZodErrors } from '@/lib/validators'
import { sanitizeSlug, generateUniqueSlug } from '@/lib/security'

const log = logger.child('api:restaurants')

// GET /api/restaurants?userId=xxx&page=1&limit=50
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')
    const pagination = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const where: any = {}
    if (userId) where.userId = userId
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          _count: { select: { dishes: true, menus: true, tables: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.restaurant.count({ where }),
    ])

    return NextResponse.json({
      restaurants,
      total,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit),
    })
  } catch (error) {
    log.error('GET failed', { error })
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 })
  }
}

// POST /api/restaurants
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = RestaurantCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    // userId comes from auth context (cookie) — for now accept from body
    const userId = body.userId
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const { wifiPassword, ...data } = parsed.data

    // Generate unique slug
    const baseSlug = data.slug || sanitizeSlug(data.name)
    const slug = await generateUniqueSlug(baseSlug, async (s) => {
      const existing = await prisma.restaurant.findUnique({ where: { slug: s } })
      return !!existing
    })

    const restaurant = await prisma.restaurant.create({
      data: {
        ...data,
        slug,
        userId,
        // Wi-Fi password encryption handled separately if provided
      },
    })

    log.info('Restaurant created', { id: restaurant.id, slug })
    return NextResponse.json({ restaurant }, { status: 201 })
  } catch (error) {
    log.error('POST failed', { error })
    return NextResponse.json({ error: 'Failed to create restaurant' }, { status: 500 })
  }
}
