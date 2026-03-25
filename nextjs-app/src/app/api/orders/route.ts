import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { OrderCreateSchema, paginationSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:orders')

// GET /api/orders?restaurantId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status')
    const pagination = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
    }

    const where: any = { restaurantId }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: { dish: { select: { id: true, name: true, imageUrlSm: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      total,
      page: pagination.page,
      totalPages: Math.ceil(total / pagination.limit),
    })
  } catch (error) {
    log.error('GET failed', { error })
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders — Guest places an order (feature-flagged)
export async function POST(request: NextRequest) {
  try {
    // Feature flag gate
    if (!isFeatureEnabled('FF_GUEST_ORDERING')) {
      return NextResponse.json(
        { error: 'Ordering is not yet available' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const parsed = OrderCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const { restaurantId, tableId, guestName, guestPhone, notes, items } = parsed.data

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId, isActive: true },
    })
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Fetch dish prices for total calculation (snapshot prices at order time)
    const dishIds = items.map((i) => i.dishId)
    const dishes = await prisma.dish.findMany({
      where: { id: { in: dishIds }, status: 'active' },
      select: { id: true, price: true, name: true },
    })

    const dishMap = new Map(dishes.map((d) => [d.id, d]))

    // Validate all dishes exist and are active
    for (const item of items) {
      if (!dishMap.has(item.dishId)) {
        return NextResponse.json(
          { error: `Dish ${item.dishId} is not available` },
          { status: 400 }
        )
      }
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => {
      const dish = dishMap.get(item.dishId)!
      return sum + dish.price * item.quantity
    }, 0)

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          restaurantId,
          tableId: tableId || null,
          guestName: guestName || null,
          guestPhone: guestPhone || null,
          notes: notes || null,
          totalAmount,
          status: 'pending',
        },
      })

      await tx.orderItem.createMany({
        data: items.map((item) => ({
          orderId: newOrder.id,
          dishId: item.dishId,
          quantity: item.quantity,
          price: dishMap.get(item.dishId)!.price,
          specialInstructions: item.specialInstructions || null,
        })),
      })

      return tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          items: {
            include: { dish: { select: { id: true, name: true } } },
          },
        },
      })
    })

    log.info('Order created', { id: order?.id, restaurantId, totalAmount, itemCount: items.length })
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    log.error('POST failed', { error })
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
