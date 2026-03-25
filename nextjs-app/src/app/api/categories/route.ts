import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { CategoryCreateSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:categories')

// GET /api/categories?menuId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const menuId = searchParams.get('menuId')

    if (!menuId) {
      return NextResponse.json({ error: 'menuId is required' }, { status: 400 })
    }

    const categories = await prisma.category.findMany({
      where: { menuId },
      include: {
        menuDishes: {
          orderBy: { sortOrder: 'asc' },
          include: { dish: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    log.error('GET failed', { error })
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CategoryCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const menu = await prisma.menu.findUnique({ where: { id: parsed.data.menuId } })
    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
    }

    const category = await prisma.category.create({ data: parsed.data })

    log.info('Category created', { id: category.id, menuId: category.menuId })
    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    log.error('POST failed', { error })
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
