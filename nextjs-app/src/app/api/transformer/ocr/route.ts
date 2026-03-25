/**
 * POST /api/transformer/ocr
 *
 * OCR Pipeline — extract menu text from uploaded images.
 *
 * Phase 03: Transformer
 *
 * ⚠️ TODO: This is a PLACEHOLDER for a real OCR pipeline.
 *    A real developer should implement one of these approaches:
 *
 *    Option A — Google Cloud Vision API:
 *      1. Set GOOGLE_CLOUD_VISION_API_KEY in .env.local
 *      2. Call https://vision.googleapis.com/v1/images:annotate
 *      3. Use TEXT_DETECTION or DOCUMENT_TEXT_DETECTION feature
 *      4. Parse bounding boxes and text blocks into structured data
 *      Cost: ~$1.50 per 1,000 images
 *
 *    Option B — Tesseract.js (free, on-server):
 *      1. npm install tesseract.js
 *      2. Load image buffer from Supabase Storage or upload
 *      3. Run worker.recognize(buffer, lang)
 *      4. Parse text into structured menu data
 *      Pros: Free, no external API needed
 *      Cons: Lower accuracy, especially for multi-language menus
 *
 *    Option C — OpenAI GPT-4 Vision:
 *      1. Set OPENAI_API_KEY (direct, not proxy)
 *      2. Send image as base64 or URL to GPT-4 Vision
 *      3. Ask GPT to extract structured menu data (JSON)
 *      4. Parse response into dishes/categories
 *      Cost: ~$0.01-0.05 per image depending on resolution
 *      Pros: Best accuracy, handles complex layouts
 *
 *    Option D — Azure AI Document Intelligence:
 *      1. Set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and KEY
 *      2. Use prebuilt-layout or custom model
 *      3. Parse tables and text blocks
 *      Cost: ~$1.50 per 1,000 pages
 *
 *    Recommended: Option C (GPT-4 Vision) for MVP, Option A for production.
 *
 *    After OCR extraction, the structured data should be passed to:
 *    - /api/transformer/translate for translation
 *    - /api/transformer/describe for description generation
 *    - /api/dishes (POST) to create dish records
 *
 * Request body:
 *   - imageUrl: string (Supabase Storage URL or uploaded image)
 *   - restaurantId: string (UUID)
 *   - sourceLang?: string (language of the original menu, default 'ru')
 *   - format?: 'structured' | 'raw' (output format)
 *
 * Response:
 *   - extractedText: string (raw OCR text)
 *   - structuredData?: { categories: [...], dishes: [...] }
 *   - confidence: number (0-1)
 *   - provider: string
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export interface OcrExtractedDish {
  name: string
  description?: string
  price?: number
  category?: string
}

export interface OcrResult {
  extractedText: string
  structuredData?: {
    categories: Array<{ name: string; dishes: OcrExtractedDish[] }>
    rawDishes: OcrExtractedDish[]
  }
  confidence: number
  provider: 'google-vision' | 'tesseract' | 'gpt4-vision' | 'azure' | 'demo'
  tokensUsed: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, restaurantId, sourceLang, format } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 })
    }

    logger.info('[api/transformer/ocr] OCR request received', {
      imageUrl: imageUrl.substring(0, 100),
      restaurantId,
      sourceLang: sourceLang || 'ru',
      format: format || 'structured',
    })

    // ─── Check for available OCR providers ─────────────────────────────
    // TODO: Implement real OCR provider detection
    // const hasGoogleVision = !!process.env.GOOGLE_CLOUD_VISION_API_KEY
    // const hasOpenAIVision = !!process.env.OPENAI_API_KEY && !process.env.OPENAI_BASE_URL?.includes('genspark')
    // const hasAzure = !!process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT

    // ─── GPT-4 Vision OCR (placeholder) ─────────────────────────────────
    // TODO: Uncomment and implement when OPENAI_API_KEY is available
    /*
    if (hasOpenAIVision) {
      const { getOpenAI } = await import('@/lib/transformer').then(m => m.getOpenAIHelpers())
      const openai = getOpenAI()

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a menu OCR specialist. Extract all dishes from the menu image.
Return a JSON object with:
{
  "categories": [
    {
      "name": "Category Name",
      "dishes": [
        { "name": "Dish Name", "description": "Optional description", "price": 1500, "category": "Category Name" }
      ]
    }
  ],
  "rawText": "Full extracted text from the image"
}
Prices should be in the original currency as integers. If you can't determine the category, use "Uncategorized".
Language of the menu: ${sourceLang || 'ru'}.`,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all dishes, prices, and categories from this menu image:' },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content)

      return NextResponse.json({
        extractedText: parsed.rawText || '',
        structuredData: parsed.categories ? { categories: parsed.categories, rawDishes: parsed.categories.flatMap(c => c.dishes) } : undefined,
        confidence: 0.85,
        provider: 'gpt4-vision',
        tokensUsed: response.usage?.total_tokens || 0,
      })
    }
    */

    // ─── Demo mode: return placeholder data ──────────────────────────────
    const demoResult: OcrResult = {
      extractedText: [
        '=== ДЕМО-РЕЖИМ OCR ===',
        '',
        'Для реального распознавания текста меню настройте один из провайдеров:',
        '• OPENAI_API_KEY — для GPT-4 Vision OCR (рекомендуется)',
        '• GOOGLE_CLOUD_VISION_API_KEY — для Google Cloud Vision',
        '• Tesseract.js — бесплатное решение (npm install tesseract.js)',
        '',
        '--- Пример извлечённого меню ---',
        '',
        'САЛАТЫ',
        'Цезарь с курицей — 2800 AMD',
        'Греческий салат — 2200 AMD',
        'Оливье — 1800 AMD',
        '',
        'ГОРЯЧИЕ БЛЮДА',
        'Хоровац (свинина) — 4500 AMD',
        'Долма — 3200 AMD',
        'Кебаб из баранины — 3800 AMD',
      ].join('\n'),
      structuredData: {
        categories: [
          {
            name: 'Салаты',
            dishes: [
              { name: 'Цезарь с курицей', description: 'Классический салат Цезарь с куриной грудкой', price: 2800, category: 'Салаты' },
              { name: 'Греческий салат', description: 'Свежие овощи с сыром фета', price: 2200, category: 'Салаты' },
              { name: 'Оливье', description: 'Традиционный русский салат', price: 1800, category: 'Салаты' },
            ],
          },
          {
            name: 'Горячие блюда',
            dishes: [
              { name: 'Хоровац (свинина)', description: 'Армянский шашлык на углях', price: 4500, category: 'Горячие блюда' },
              { name: 'Долма', description: 'Виноградные листья с мясной начинкой', price: 3200, category: 'Горячие блюда' },
              { name: 'Кебаб из баранины', description: 'Сочный кебаб из молодой баранины', price: 3800, category: 'Горячие блюда' },
            ],
          },
        ],
        rawDishes: [
          { name: 'Цезарь с курицей', price: 2800, category: 'Салаты' },
          { name: 'Греческий салат', price: 2200, category: 'Салаты' },
          { name: 'Оливье', price: 1800, category: 'Салаты' },
          { name: 'Хоровац (свинина)', price: 4500, category: 'Горячие блюда' },
          { name: 'Долма', price: 3200, category: 'Горячие блюда' },
          { name: 'Кебаб из баранины', price: 3800, category: 'Горячие блюда' },
        ],
      },
      confidence: 0,
      provider: 'demo',
      tokensUsed: 0,
    }

    // Record usage (demo)
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.transformerUsage.create({
        data: {
          restaurantId,
          type: 'ocr',
          provider: 'demo',
          tokensUsed: 0,
          metadata: { imageUrl: imageUrl.substring(0, 200), sourceLang } as never,
        },
      })
    } catch {
      // Silently fail if table doesn't exist
    }

    return NextResponse.json(demoResult)
  } catch (err) {
    logger.error('[api/transformer/ocr] Failed', { error: String(err) })
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 })
  }
}
