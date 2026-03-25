import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { DishCreateSchema, paginationSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:dishes')

// GET /api/dishes?restaurantId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const pagination = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
    }

    const where: any = { restaurantId }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [dishes, total] = await Promise.all([
      prisma.dish.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.dish.count({ where }),
    ])

    return NextResponse.json({
      dishes,
      total,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit),
    })
  } catch (error) {
    log.error('GET failed', { error })
    return NextResponse.json({ error: 'Failed to fetch dishes' }, { status: 500 })
  }
}

// POST /api/dishes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = DishCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    // Check dish limit based on subscription
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parsed.data.restaurantId },
      include: {
        user: { include: { subscription: true } },
        _count: { select: { dishes: { where: { status: { not: 'archived' } } } } },
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const maxDishes = restaurant.user?.subscription?.maxDishes ?? 30
    if (maxDishes !== -1 && restaurant._count.dishes >= maxDishes) {
      return NextResponse.json(
        { error: `Dish limit reached (${maxDishes}). Upgrade your plan.` },
        { status: 403 }
      )
    }

    const dish = await prisma.dish.create({
      data: parsed.data,
    })

    log.info('Dish created', { id: dish.id, restaurantId: dish.restaurantId })
    return NextResponse.json({ dish }, { status: 201 })
  } catch (error) {
    log.error('POST failed', { error })
    return NextResponse.json({ error: 'Failed to create dish' }, { status: 500 })
  }
}
