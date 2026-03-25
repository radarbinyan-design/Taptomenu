/**
 * GET /api/transformer/usage
 *
 * Get transformer usage stats for a restaurant.
 * Shows token usage by type (translation/description/image) and provider.
 *
 * Phase 03: Transformer
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getTransformerStatus } from '@/lib/transformer'

export async function GET(request: NextRequest) {
  try {
    const restaurantId = request.nextUrl.searchParams.get('restaurantId')
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30', 10)

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId required' }, { status: 400 })
    }

    const since = new Date()
    since.setDate(since.getDate() - days)

    let usageData: Array<{
      type: string
      provider: string
      tokensUsed: number
      createdAt: Date
    }> = []

    try {
      usageData = await prisma.transformerUsage.findMany({
        where: {
          restaurantId,
          createdAt: { gte: since },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      })
    } catch {
      // Table might not exist — return empty data
      logger.warn('[api/transformer/usage] TransformerUsage table not available')
    }

    // Aggregate by type
    const byType: Record<string, { count: number; tokensUsed: number }> = {}
    const byProvider: Record<string, { count: number; tokensUsed: number }> = {}

    for (const row of usageData) {
      if (!byType[row.type]) byType[row.type] = { count: 0, tokensUsed: 0 }
      byType[row.type].count++
      byType[row.type].tokensUsed += row.tokensUsed

      if (!byProvider[row.provider]) byProvider[row.provider] = { count: 0, tokensUsed: 0 }
      byProvider[row.provider].count++
      byProvider[row.provider].tokensUsed += row.tokensUsed
    }

    const totalTokens = usageData.reduce((sum, r) => sum + r.tokensUsed, 0)
    const totalRequests = usageData.length

    // Get system status
    const status = getTransformerStatus()

    return NextResponse.json({
      usage: {
        totalTokens,
        totalRequests,
        byType,
        byProvider,
        period: days,
      },
      status,
      recentActivity: usageData.slice(0, 20).map(r => ({
        type: r.type,
        provider: r.provider,
        tokensUsed: r.tokensUsed,
        createdAt: r.createdAt,
      })),
    })
  } catch (err) {
    logger.error('[api/transformer/usage] Failed', { error: String(err) })
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 })
  }
}
