import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { MenuUpdateSchema, MenuDishLinkSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:menus:[id]')

// GET /api/menus/[id] — full menu with categories and dishes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            menuDishes: {
              orderBy: { sortOrder: 'asc' },
              include: { dish: true },
            },
          },
        },
        menuDishes: {
          where: { categoryId: null },
          orderBy: { sortOrder: 'asc' },
          include: { dish: true },
        },
      },
    })

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
    }

    return NextResponse.json({ menu })
  } catch (error) {
    log.error('GET failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}

// PATCH /api/menus/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = MenuUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.menu.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
    }

    // Handle default flag toggle
    if (parsed.data.isDefault === true) {
      await prisma.menu.updateMany({
        where: { restaurantId: existing.restaurantId, isDefault: true, id: { not: params.id } },
        data: { isDefault: false },
      })
    }

    const menu = await prisma.menu.update({
      where: { id: params.id },
      data: parsed.data,
    })

    log.info('Menu updated', { id: menu.id })
    return NextResponse.json({ menu })
  } catch (error) {
    log.error('PATCH failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 })
  }
}

// DELETE /api/menus/[id] — soft delete (set inactive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.menu.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
    }

    const menu = await prisma.menu.update({
      where: { id: params.id },
      data: { status: 'inactive' },
    })

    log.info('Menu deactivated', { id: menu.id })
    return NextResponse.json({ message: 'Menu deactivated', menu })
  } catch (error) {
    log.error('DELETE failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to delete menu' }, { status: 500 })
  }
}

// PUT /api/menus/[id] — Link dish to menu (add MenuDish)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = MenuDishLinkSchema.safeParse({ ...body, menuId: params.id })

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const menuDish = await prisma.menuDish.upsert({
      where: {
        menuId_dishId: { menuId: params.id, dishId: parsed.data.dishId },
      },
      create: parsed.data,
      update: {
        categoryId: parsed.data.categoryId,
        sortOrder: parsed.data.sortOrder,
        isAvailable: parsed.data.isAvailable,
        specialPrice: parsed.data.specialPrice,
      },
      include: { dish: true },
    })

    log.info('Dish linked to menu', { menuId: params.id, dishId: parsed.data.dishId })
    return NextResponse.json({ menuDish })
  } catch (error) {
    log.error('PUT (link dish) failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to link dish to menu' }, { status: 500 })
  }
}
