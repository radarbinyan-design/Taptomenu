import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/dishes?restaurantId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.dish.count({ where }),
    ])

    return NextResponse.json({
      dishes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('GET /api/dishes error:', error)
    return NextResponse.json({ error: 'Ошибка получения блюд' }, { status: 500 })
  }
}

// POST /api/dishes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      restaurantId,
      name,
      price,
      description,
      calories,
      proteins,
      fats,
      carbohydrates,
      weight,
      spicyLevel = 0,
      isVegan = false,
      isGlutenFree = false,
      allergens = [],
      tags = [],
    } = body

    if (!restaurantId || !name || !price) {
      return NextResponse.json(
        { error: 'restaurantId, name и price обязательны' },
        { status: 400 }
      )
    }

    // Check dish limit based on subscription
    // TODO: Add subscription check

    const dish = await prisma.dish.create({
      data: {
        restaurantId,
        name,
        price: parseInt(price),
        description,
        calories: calories ? parseInt(calories) : null,
        proteins: proteins ? parseFloat(proteins) : null,
        fats: fats ? parseFloat(fats) : null,
        carbohydrates: carbohydrates ? parseFloat(carbohydrates) : null,
        weight: weight ? parseInt(weight) : null,
        spicyLevel,
        isVegan,
        isGlutenFree,
        allergens,
        tags,
      },
    })

    return NextResponse.json({ dish }, { status: 201 })
  } catch (error) {
    console.error('POST /api/dishes error:', error)
    return NextResponse.json({ error: 'Ошибка создания блюда' }, { status: 500 })
  }
}
