/**
 * POST /api/transformer/image
 *
 * Generate a dish image using AI (DALL-E 3).
 *
 * Phase 03: Transformer
 *
 * ⚠️ TODO: DALL-E integration requires a DIRECT OpenAI API key.
 *    Proxy keys (e.g. GenSpark) do NOT support image generation.
 *
 *    A real developer should:
 *    1. Get a direct OpenAI API key at https://platform.openai.com/api-keys
 *    2. Set OPENAI_API_KEY in .env.local (ensure it's NOT a proxy)
 *    3. DALL-E 3 pricing:
 *       - Standard quality: ~$0.04/image (1024x1024)
 *       - HD quality: ~$0.08/image (1024x1024)
 *       - HD quality: ~$0.12/image (1792x1024 or 1024x1792)
 *    4. Consider caching generated images in Supabase Storage to avoid
 *       regeneration costs. Upload the URL to Supabase Storage and save
 *       the persistent URL in dish.imageUrl.
 *    5. Alternative image APIs to consider:
 *       - Stability AI (Stable Diffusion): https://stability.ai/
 *       - Midjourney API (when available)
 *       - Replicate (various models): https://replicate.com/
 *       - Flux (open source): fast, high quality
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { ImageGenerateRequestSchema, formatZodErrors } from '@/lib/validators'
import { generateImage } from '@/lib/transformer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate with Zod
    const parsed = ImageGenerateRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const { dishId, dishName, description, style, save, restaurantId } = parsed.data

    const result = await generateImage({
      dishName,
      description,
      style: style || 'photo',
    })

    // Optionally save imageUrl to dish
    if (save && dishId && result.imageUrl) {
      try {
        // TODO: For production, download the DALL-E URL and upload to Supabase Storage
        // DALL-E URLs are temporary (expire after ~1 hour).
        // Implementation:
        //   1. const imageBuffer = await fetch(result.imageUrl).then(r => r.arrayBuffer())
        //   2. const { data } = await supabase.storage.from('dishes').upload(`${dishId}.webp`, imageBuffer)
        //   3. Save data.publicUrl to dish.imageUrl
        await prisma.dish.update({
          where: { id: dishId },
          data: { imageUrl: result.imageUrl },
        })
      } catch {
        logger.warn('[api/transformer/image] Could not save imageUrl to DB')
      }
    }

    // Record usage
    if (restaurantId) {
      try {
        await prisma.transformerUsage.create({
          data: {
            restaurantId,
            type: 'image',
            tokensUsed: result.tokensUsed,
            provider: result.provider,
            metadata: { dishId, dishName, style } as never,
          },
        })
      } catch {
        // Silently fail
      }
    }

    logger.info('[api/transformer/image] Image generated', {
      dishName,
      provider: result.provider,
      hasImage: !!result.imageUrl,
    })

    return NextResponse.json({
      imageUrl: result.imageUrl,
      provider: result.provider,
      tokensUsed: result.tokensUsed,
    })
  } catch (err) {
    logger.error('[api/transformer/image] Failed', { error: String(err) })
    return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
  }
}
