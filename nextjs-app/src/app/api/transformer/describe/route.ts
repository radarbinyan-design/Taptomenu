/**
 * POST /api/transformer/describe
 *
 * Generate AI-powered dish descriptions.
 * Optionally saves to dish.description / descriptionTranslations in DB.
 *
 * Phase 03: Transformer
 *
 * ⚠️ API KEY REQUIREMENTS:
 *   - Set OPENAI_API_KEY in .env.local for real AI descriptions
 *   - Without API key, returns template-based demo descriptions
 *   - A real developer should obtain an OpenAI API key at:
 *     https://platform.openai.com/api-keys
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { DescribeRequestSchema, formatZodErrors } from '@/lib/validators'
import { generateDescription } from '@/lib/transformer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const parsed = DescribeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const {
      dishId,
      dishName,
      ingredients,
      category,
      targetLang,
      style,
      save,
      restaurantId,
    } = parsed.data

    const result = await generateDescription({
      dishName,
      ingredients,
      category,
      targetLang: targetLang || 'ru',
      style: style || 'appetizing',
    })

    // Optionally save to DB
    if (save && dishId) {
      try {
        const lang = targetLang || 'ru'
        if (lang === 'ru') {
          // Save as primary description
          await prisma.dish.update({
            where: { id: dishId },
            data: { description: result.description },
          })
        } else {
          // Save as translation
          const existing = await prisma.dish.findUnique({
            where: { id: dishId },
            select: { descriptionTranslations: true },
          })
          const translations = (existing?.descriptionTranslations as Record<string, string>) || {}
          translations[lang] = result.description

          await prisma.dish.update({
            where: { id: dishId },
            data: { descriptionTranslations: translations },
          })
        }
      } catch {
        logger.warn('[api/transformer/describe] Could not save to DB (DB may not be available)')
      }
    }

    // Record usage
    if (restaurantId) {
      try {
        await prisma.transformerUsage.create({
          data: {
            restaurantId,
            type: 'description',
            tokensUsed: result.tokensUsed,
            provider: result.provider,
            metadata: { dishId, dishName, targetLang, style } as never,
          },
        })
      } catch {
        // Silently fail if table doesn't exist
      }
    }

    logger.info('[api/transformer/describe] Description generated', {
      dishName,
      provider: result.provider,
      tokensUsed: result.tokensUsed,
    })

    return NextResponse.json({
      description: result.description,
      provider: result.provider,
      tokensUsed: result.tokensUsed,
    })
  } catch (err) {
    logger.error('[api/transformer/describe] Failed', { error: String(err) })
    return NextResponse.json({ error: 'Description generation failed' }, { status: 500 })
  }
}
