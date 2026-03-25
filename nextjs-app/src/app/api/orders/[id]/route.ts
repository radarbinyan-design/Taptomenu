import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { OrderStatusUpdateSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:orders:[id]')

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            dish: {
              select: { id: true, name: true, nameTranslations: true, imageUrlSm: true },
            },
          },
        },
        restaurant: { select: { id: true, name: true, slug: true } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    log.error('GET failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] — Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = OrderStatusUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 })
    }

    const existing = await prisma.order.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate state transitions
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['delivered'],
      delivered: [],
      cancelled: [],
    }

    const allowed = validTransitions[existing.status] || []
    if (!allowed.includes(parsed.data.status)) {
      return NextResponse.json(
        { error: `Cannot transition from '${existing.status}' to '${parsed.data.status}'` },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status as any },
      include: {
        items: {
          include: { dish: { select: { id: true, name: true } } },
        },
      },
    })

    log.info('Order status updated', { id: order.id, from: existing.status, to: parsed.data.status })
    return NextResponse.json({ order })
  } catch (error) {
    log.error('PATCH failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
