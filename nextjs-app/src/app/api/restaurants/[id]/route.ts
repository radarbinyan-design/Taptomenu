import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { RestaurantUpdateSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:restaurants:[id]')

// GET /api/restaurants/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: params.id },
      include: {
        menus: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { dishes: true, menus: true, tables: true, menuViews: true } },
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    return NextResponse.json({ restaurant })
  } catch (error) {
    log.error('GET failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to fetch restaurant' }, { status: 500 })
  }
}

// PATCH /api/restaurants/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = RestaurantUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.restaurant.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: parsed.data,
    })

    log.info('Restaurant updated', { id: restaurant.id })
    return NextResponse.json({ restaurant })
  } catch (error) {
    log.error('PATCH failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
  }
}

// DELETE /api/restaurants/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.restaurant.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Soft delete: deactivate instead of removing
    const restaurant = await prisma.restaurant.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    log.info('Restaurant deactivated', { id: restaurant.id })
    return NextResponse.json({ message: 'Restaurant deactivated', restaurant })
  } catch (error) {
    log.error('DELETE failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to delete restaurant' }, { status: 500 })
  }
}
