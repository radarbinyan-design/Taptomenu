import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { DishUpdateSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:dishes:[id]')

// GET /api/dishes/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dish = await prisma.dish.findUnique({
      where: { id: params.id },
      include: {
        menuDishes: {
          include: { menu: { select: { id: true, name: true } }, category: { select: { id: true, name: true } } },
        },
      },
    })

    if (!dish) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 })
    }

    return NextResponse.json({ dish })
  } catch (error) {
    log.error('GET failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to fetch dish' }, { status: 500 })
  }
}

// PATCH /api/dishes/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = DishUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 })
    }

    const existing = await prisma.dish.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 })
    }

    const dish = await prisma.dish.update({
      where: { id: params.id },
      data: parsed.data,
    })

    log.info('Dish updated', { id: dish.id })
    return NextResponse.json({ dish })
  } catch (error) {
    log.error('PATCH failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to update dish' }, { status: 500 })
  }
}

// DELETE /api/dishes/[id] — soft delete (archive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.dish.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 })
    }

    const dish = await prisma.dish.update({
      where: { id: params.id },
      data: { status: 'archived' },
    })

    log.info('Dish archived', { id: dish.id })
    return NextResponse.json({ message: 'Dish archived', dish })
  } catch (error) {
    log.error('DELETE failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to archive dish' }, { status: 500 })
  }
}
