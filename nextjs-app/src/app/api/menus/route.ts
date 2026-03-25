import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { MenuCreateSchema, paginationSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:menus')

// GET /api/menus?restaurantId=xxx
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

    const where: any = { restaurantId }
    const status = searchParams.get('status')
    if (status) where.status = status

    const [menus, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        include: {
          categories: {
            orderBy: { sortOrder: 'asc' },
            include: {
              _count: { select: { menuDishes: true } },
            },
          },
          _count: { select: { menuDishes: true } },
        },
        orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.menu.count({ where }),
    ])

    return NextResponse.json({
      menus,
      total,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit),
    })
  } catch (error) {
    log.error('GET failed', { error })
    return NextResponse.json({ error: 'Failed to fetch menus' }, { status: 500 })
  }
}

// POST /api/menus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = MenuCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    // Check subscription limit
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: parsed.data.restaurantId },
      include: {
        user: { include: { subscription: true } },
        _count: { select: { menus: true } },
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const maxMenus = restaurant.user?.subscription?.maxMenus ?? 1
    if (maxMenus !== -1 && restaurant._count.menus >= maxMenus) {
      return NextResponse.json(
        { error: `Menu limit reached (${maxMenus}). Upgrade your plan.` },
        { status: 403 }
      )
    }

    // If this is the first menu or marked as default, handle default flag
    const data = { ...parsed.data }
    if (data.isDefault) {
      await prisma.menu.updateMany({
        where: { restaurantId: data.restaurantId, isDefault: true },
        data: { isDefault: false },
      })
    } else if (restaurant._count.menus === 0) {
      data.isDefault = true
    }

    const menu = await prisma.menu.create({ data })

    log.info('Menu created', { id: menu.id, restaurantId: menu.restaurantId })
    return NextResponse.json({ menu }, { status: 201 })
  } catch (error) {
    log.error('POST failed', { error })
    return NextResponse.json({ error: 'Failed to create menu' }, { status: 500 })
  }
}
