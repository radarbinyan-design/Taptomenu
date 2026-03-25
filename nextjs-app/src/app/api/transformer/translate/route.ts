/**
 * POST /api/transformer/translate
 *
 * Batch translate a menu's dishes and categories into target languages.
 * Saves translations to dish.nameTranslations / descriptionTranslations
 * and category.nameTranslations in DB.
 *
 * Phase 03: Transformer
 *
 * ⚠️ API KEY REQUIREMENTS:
 *   - DeepL:   Set DEEPL_API_KEY in .env.local (premium/luxe plans)
 *   - Google:  Set GOOGLE_TRANSLATE_API_KEY in .env.local
 *   - OpenAI:  Set OPENAI_API_KEY in .env.local (GPT fallback)
 *   - Demo:    Always available — returns [LANG] prefixed text
 *
 *   Without API keys, translations work in demo mode.
 *   A real developer should obtain keys from the respective providers.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { TranslateRequestSchema, formatZodErrors } from '@/lib/validators'
import {
  batchTranslateMenu,
  getBestTranslationProvider,
  type TranslationProvider,
} from '@/lib/transformer'
import type { SubscriptionPlan } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const parsed = TranslateRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const { menuId, restaurantId, targetLangs, sourceLang, provider } = parsed.data

    // Get subscription to determine best provider
    const userId = request.headers.get('x-user-id') || request.cookies.get('user-id')?.value
    let userPlan: SubscriptionPlan = 'starter'
    if (userId) {
      try {
        const sub = await prisma.subscription.findUnique({ where: { userId } })
        if (sub) userPlan = sub.plan
      } catch {
        // DB may not be available — continue with starter plan
      }
    }

    const selectedProvider: TranslationProvider = provider || getBestTranslationProvider(userPlan)

    // Fetch menu with dishes and categories
    let menu: {
      id: string
      categories: Array<{ id: string; name: string }>
      menuDishes: Array<{ dish: { id: string; name: string; description: string | null } }>
    } | null = null

    try {
      menu = await prisma.menu.findUnique({
        where: { id: menuId },
        include: {
          categories: true,
          menuDishes: {
            include: { dish: true },
          },
        },
      })
    } catch {
      // DB not available — use demo mode
      logger.warn('[api/transformer/translate] DB not available, using demo data')
    }

    if (!menu) {
      // Demo mode: generate sample translations
      const demoTranslations: Record<string, Record<string, { name: string; description?: string }>> = {}
      for (const lang of targetLangs) {
        demoTranslations[lang] = {
          'demo-dish-1': { name: `[${lang.toUpperCase()}] Хоровац`, description: `[${lang.toUpperCase()}] Армянский шашлык` },
          'demo-dish-2': { name: `[${lang.toUpperCase()}] Долма`, description: `[${lang.toUpperCase()}] Виноградные листья с начинкой` },
        }
      }
      return NextResponse.json({
        success: true,
        provider: 'demo',
        translations: demoTranslations,
        stats: {
          dishesTranslated: 2 * targetLangs.length,
          categoriesTranslated: 0,
          languages: targetLangs.length,
          tokensUsed: 0,
        },
        demo: true,
      })
    }

    // Prepare dish and category data
    const dishes = menu.menuDishes.map(md => ({
      id: md.dish.id,
      name: md.dish.name,
      description: md.dish.description || undefined,
    }))

    const categories = menu.categories.map(c => ({
      id: c.id,
      name: c.name,
    }))

    // Run batch translation
    const result = await batchTranslateMenu(
      dishes,
      categories,
      targetLangs,
      sourceLang || 'ru',
      selectedProvider
    )

    // Save translations to DB
    let savedDishes = 0
    let savedCategories = 0

    for (const lang of targetLangs) {
      const langTranslations = result.translations[lang]
      if (!langTranslations) continue

      // Update each dish
      for (const dish of dishes) {
        const translation = langTranslations[dish.id]
        if (!translation) continue

        try {
          const existingDish = await prisma.dish.findUnique({
            where: { id: dish.id },
            select: { nameTranslations: true, descriptionTranslations: true },
          })

          const nameTranslations = (existingDish?.nameTranslations as Record<string, string>) || {}
          nameTranslations[lang] = translation.name

          const updateData: Record<string, unknown> = { nameTranslations }

          if (translation.description) {
            const descTranslations = (existingDish?.descriptionTranslations as Record<string, string>) || {}
            descTranslations[lang] = translation.description
            updateData.descriptionTranslations = descTranslations
          }

          await prisma.dish.update({
            where: { id: dish.id },
            data: updateData,
          })
          savedDishes++
        } catch {
          logger.warn('[api/transformer/translate] Failed to save dish translation', { dishId: dish.id })
        }
      }

      // Update each category
      for (const cat of categories) {
        const translation = langTranslations[`cat-${cat.id}`]
        if (!translation) continue

        try {
          const existingCat = await prisma.category.findUnique({
            where: { id: cat.id },
            select: { nameTranslations: true },
          })

          const nameTranslations = (existingCat?.nameTranslations as Record<string, string>) || {}
          nameTranslations[lang] = translation.name

          await prisma.category.update({
            where: { id: cat.id },
            data: { nameTranslations },
          })
          savedCategories++
        } catch {
          logger.warn('[api/transformer/translate] Failed to save category translation', { catId: cat.id })
        }
      }
    }

    // Record usage
    await recordUsage(restaurantId, 'translation', result.totalTokensUsed, {
      provider: result.provider,
      menuId,
      langs: targetLangs,
      dishCount: result.dishCount,
    })

    // Update menu languages array
    try {
      const existingMenu = await prisma.menu.findUnique({ where: { id: menuId }, select: { languages: true } })
      const currentLangs = new Set(existingMenu?.languages || ['ru'])
      for (const lang of targetLangs) currentLangs.add(lang)
      await prisma.menu.update({
        where: { id: menuId },
        data: { languages: Array.from(currentLangs) },
      })
    } catch {
      // Non-critical — menu languages update failed
    }

    logger.info('[api/transformer/translate] Batch translation complete', {
      menuId,
      provider: result.provider,
      langs: targetLangs,
      dishes: result.dishCount,
      tokensUsed: result.totalTokensUsed,
    })

    return NextResponse.json({
      success: true,
      provider: result.provider,
      translations: result.translations,
      stats: {
        dishesTranslated: savedDishes,
        categoriesTranslated: savedCategories,
        languages: targetLangs.length,
        tokensUsed: result.totalTokensUsed,
      },
    })
  } catch (err) {
    logger.error('[api/transformer/translate] Failed', { error: String(err) })
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}

// ─── Usage recording helper ─────────────────────────────────────────────────

async function recordUsage(
  restaurantId: string,
  type: string,
  tokensUsed: number,
  metadata: Record<string, unknown>
) {
  try {
    await prisma.transformerUsage.create({
      data: {
        restaurantId,
        type,
        tokensUsed,
        provider: String(metadata.provider || 'demo'),
        metadata: metadata as never,
      },
    })
  } catch {
    // Table might not exist yet — silently fail
    logger.warn('[transformer] Could not record usage (table may not exist)')
  }
}
