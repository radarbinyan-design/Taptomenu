import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { TableUpdateSchema, formatZodErrors } from '@/lib/validators'

const log = logger.child('api:tables:[id]')

// PATCH /api/tables/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const parsed = TableUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: formatZodErrors(parsed.error) }, { status: 400 })
    }

    const existing = await prisma.table.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    const table = await prisma.table.update({
      where: { id: params.id },
      data: parsed.data,
    })

    log.info('Table updated', { id: table.id })
    return NextResponse.json({ table })
  } catch (error) {
    log.error('PATCH failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}

// DELETE /api/tables/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.table.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    const table = await prisma.table.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    log.info('Table deactivated', { id: table.id })
    return NextResponse.json({ message: 'Table deactivated', table })
  } catch (error) {
    log.error('DELETE failed', { error, id: params.id })
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}
