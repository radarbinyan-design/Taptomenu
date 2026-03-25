import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { CategoryUpdateSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:categories:[id]')

// PATCH /api/categories/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = CategoryUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 })
    }

    const existing = await prisma.category.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: parsed.data,
    })

    log.info('Category updated', { id: category.id })
    return NextResponse.json({ category })
  } catch (error) {
    log.error('PATCH failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.category.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Soft delete
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    log.info('Category deactivated', { id: category.id })
    return NextResponse.json({ message: 'Category deactivated', category })
  } catch (error) {
    log.error('DELETE failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
