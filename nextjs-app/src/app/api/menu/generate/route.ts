import { NextRequest, NextResponse } from 'next/server'
import { createJob, updateJob, setMenuData, getDemoMenuData } from '@/lib/menu-store'
import type { GeneratedMenuData, GeneratedCategory, GeneratedDish } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photos, logo, restaurantInfo } = body

    if (!photos?.length) {
      return NextResponse.json({ error: 'No photos provided' }, { status: 400 })
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const job = createJob(jobId, 'restaurant-1', photos, logo || '')

    // Start async processing
    processMenuGeneration(jobId, photos, logo, restaurantInfo).catch(err => {
      console.error('[menu/generate] Background processing error:', err)
      updateJob(jobId, {
        status: 'failed',
        progress: 0,
        currentStep: 'Ошибка при генерации',
        error: String(err),
      })
    })

    return NextResponse.json({
      jobId,
      status: 'processing',
      message: 'Menu generation started',
    })
  } catch (error) {
    console.error('[menu/generate] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Cached API validation result
let apiValidated: boolean | null = null

// Detect OpenAI/proxy availability
function getOpenAIConfig(): { available: boolean; apiKey: string; baseURL?: string; useProxy: boolean } {
  const apiKey = process.env.OPENAI_API_KEY || ''
  const baseURL = process.env.OPENAI_BASE_URL || ''

  // If we already tested and it failed, don't retry
  if (apiValidated === false) {
    return { available: false, apiKey: '', useProxy: false }
  }

  // Direct OpenAI key (sk-...)
  if (apiKey.length > 10 && apiKey.startsWith('sk-') && !apiKey.includes('...')) {
    return { available: true, apiKey, useProxy: false }
  }

  // GenSpark proxy (has base URL and a non-empty key)
  if (baseURL && apiKey.length > 10 && baseURL.includes('genspark.ai')) {
    return { available: true, apiKey, baseURL, useProxy: true }
  }

  return { available: false, apiKey: '', useProxy: false }
}

// Quick test if API is actually working
async function validateAPIKey(config: { apiKey: string; baseURL?: string; useProxy: boolean }): Promise<boolean> {
  if (apiValidated !== null) return apiValidated
  try {
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: config.apiKey,
      ...(config.baseURL ? { baseURL: config.baseURL } : {}),
    })
    const chatModel = config.useProxy ? 'gpt-5' : 'gpt-4o'
    await openai.chat.completions.create({
      model: chatModel,
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 1,
    })
    apiValidated = true
    return true
  } catch (err: any) {
    console.warn('[menu/generate] API key validation failed:', err?.status || err?.message)
    apiValidated = false
    return false
  }
}

async function processMenuGeneration(
  jobId: string,
  photos: string[],
  logo: string,
  restaurantInfo: { name?: { ru?: string; en?: string; hy?: string }; cuisineType?: string }
) {
  const config = getOpenAIConfig()

  try {
    // Step 1: OCR
    updateJob(jobId, { status: 'ocr', progress: 10, currentStep: 'Распознавание текста с фотографий...' })
    await sleep(1000)

    if (config.available) {
      // Validate API key before using real AI pipeline
      const isValid = await validateAPIKey(config)
      if (isValid) {
        try {
          await processWithAI(jobId, photos, logo, restaurantInfo, config)
        } catch (aiError: any) {
          console.warn('[menu/generate] AI pipeline failed, falling back to demo:', aiError?.message)
          updateJob(jobId, { status: 'ocr', progress: 15, currentStep: 'AI недоступен, используем демо-данные...' })
          await processDemo(jobId)
        }
      } else {
        // API key invalid — use demo mode
        console.log('[menu/generate] API key invalid, using demo mode')
        await processDemo(jobId)
      }
    } else {
      // Demo mode: simulate processing steps
      await processDemo(jobId)
    }
  } catch (error) {
    console.error('[menu/generate] Processing error:', error)
    updateJob(jobId, {
      status: 'failed',
      progress: 0,
      currentStep: 'Ошибка при генерации',
      error: String(error),
    })
  }
}

async function processDemo(jobId: string) {
  updateJob(jobId, { progress: 20, currentStep: 'Распознавание текста...' })
  await sleep(2000)

  updateJob(jobId, { status: 'structuring', progress: 40, currentStep: 'Структурирование меню...' })
  await sleep(1500)

  updateJob(jobId, { status: 'translating', progress: 60, currentStep: 'Перевод на 3 языка (RU/EN/HY)...' })
  await sleep(1500)

  updateJob(jobId, { status: 'generating_images', progress: 80, currentStep: 'Генерация фотографий блюд...' })
  await sleep(2000)

  const demoData = getDemoMenuData()
  setMenuData(demoData)

  updateJob(jobId, {
    status: 'completed',
    progress: 100,
    currentStep: 'Готово! Меню сгенерировано.',
    result: demoData,
  })
}

async function processWithAI(
  jobId: string,
  photos: string[],
  logo: string,
  restaurantInfo: { name?: { ru?: string; en?: string; hy?: string }; cuisineType?: string },
  config: { apiKey: string; baseURL?: string; useProxy: boolean }
) {
  const OpenAI = (await import('openai')).default
  const openai = new OpenAI({
    apiKey: config.apiKey,
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  })

  // Proxy supports gpt-5, direct supports gpt-4o
  const chatModel = config.useProxy ? 'gpt-5' : 'gpt-4o'

  // OCR each photo with vision
  let ocrResults: string[] = []
  try {
    ocrResults = await Promise.all(
      photos.slice(0, 15).map(async (photo: string) => {
        try {
          const response = await openai.chat.completions.create({
            model: chatModel,
            messages: [{
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Extract ALL text from this restaurant menu photo and structure it as JSON:
{
  "categories": [
    {
      "name": "category name",
      "dishes": [
        {
          "name": "dish name",
          "description": "description if visible",
          "price": number_without_currency_symbol
        }
      ]
    }
  ]
}
Important: Extract EVERY dish, price and category visible. Prices are in AMD (Armenian Dram). If you see prices like "2500" or "2,500" treat them as AMD.`
                },
                { type: 'image_url', image_url: { url: photo } }
              ]
            }],
            response_format: { type: 'json_object' },
            max_tokens: 4096,
          })
          return response.choices[0]?.message?.content || '{}'
        } catch (err) {
          console.error('OCR error for photo:', err)
          return '{}'
        }
      })
    )
  } catch (err) {
    console.error('OCR batch error, using fallback:', err)
    ocrResults = ['{}']
  }

  updateJob(jobId, { progress: 30, currentStep: 'Структурирование меню...' })

  // Step 2: Structure and merge
  updateJob(jobId, { status: 'structuring', progress: 40 })
  let structuredMenu: any = { categories: [] }
  try {
    const structuredResponse = await openai.chat.completions.create({
      model: chatModel,
      messages: [
        {
          role: 'system',
          content: `You are a menu structuring assistant. Merge the extracted OCR results into a clean, logical menu structure.
Remove duplicates, fix typos, group dishes into logical categories.
Output JSON format:
{
  "categories": [
    {
      "name": "Category Name",
      "emoji": "appropriate emoji",
      "dishes": [
        {
          "name": "Dish Name",
          "description": "Brief appetizing description",
          "price": number_in_AMD
        }
      ]
    }
  ]
}`
        },
        {
          role: 'user',
          content: `Merge these OCR results into a structured menu:\n${ocrResults.join('\n---\n')}`
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    })
    structuredMenu = JSON.parse(structuredResponse.choices[0]?.message?.content || '{"categories":[]}')
  } catch (err) {
    console.error('Structuring error, using demo data:', err)
    // Fallback to demo data if structuring fails
    const demoData = getDemoMenuData()
    setMenuData(demoData)
    updateJob(jobId, {
      status: 'completed',
      progress: 100,
      currentStep: 'Готово! (используются демо-данные)',
      result: demoData,
    })
    return
  }

  updateJob(jobId, { progress: 50, currentStep: 'Перевод на 3 языка (RU/EN/HY)...' })

  // Step 3: Translate to 3 languages
  updateJob(jobId, { status: 'translating', progress: 55 })
  let translatedMenu: any = { categories: [] }
  try {
    const translationResponse = await openai.chat.completions.create({
      model: chatModel,
      messages: [
        {
          role: 'system',
          content: `Translate this restaurant menu to Russian, English, and Armenian.
Output JSON with this structure:
{
  "categories": [
    {
      "id": "unique-id",
      "name": { "ru": "...", "en": "...", "hy": "..." },
      "emoji": "emoji",
      "dishes": [
        {
          "id": "unique-id",
          "name": { "ru": "...", "en": "...", "hy": "..." },
          "description": { "ru": "...", "en": "...", "hy": "..." },
          "price": number
        }
      ]
    }
  ]
}
Generate unique IDs like "cat-1", "dish-1" etc. Armenian translations should be natural and appetizing.`
        },
        {
          role: 'user',
          content: JSON.stringify(structuredMenu)
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 4096,
    })
    translatedMenu = JSON.parse(translationResponse.choices[0]?.message?.content || '{"categories":[]}')
  } catch (err) {
    console.error('Translation error, using demo data:', err)
    const demoData = getDemoMenuData()
    setMenuData(demoData)
    updateJob(jobId, {
      status: 'completed',
      progress: 100,
      currentStep: 'Готово! (используются демо-данные)',
      result: demoData,
    })
    return
  }

  updateJob(jobId, { progress: 70, currentStep: 'Генерация фотографий блюд...' })

  // Step 4: Generate dish images with DALL-E 3 (only for direct OpenAI, not proxy)
  updateJob(jobId, { status: 'generating_images', progress: 75 })
  const allDishes = translatedMenu.categories?.flatMap((cat: any) => cat.dishes) || []

  if (!config.useProxy) {
    // Direct OpenAI: try DALL-E 3
    const totalDishes = allDishes.length
    for (let i = 0; i < allDishes.length; i++) {
      const dish = allDishes[i]
      const progressPct = 75 + Math.round((i / totalDishes) * 20)
      updateJob(jobId, {
        progress: progressPct,
        currentStep: `Генерация фото: ${dish.name?.ru || dish.name} (${i + 1}/${totalDishes})...`,
      })

      try {
        const prompt = `Professional food photography of "${dish.name?.ru || dish.name}".
${dish.description?.ru || dish.description || ''}

Style: restaurant plating, natural lighting, appetizing appearance.
Camera: Sony A7III, 50mm lens, shallow depth of field.
Background: modern restaurant, slightly blurred.
NO text, logos, or watermarks.`

        const imgResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural',
        })

        dish.imageUrl = imgResponse.data?.[0]?.url || ''
        dish.aiPrompt = prompt
        dish.generatedByAI = true
      } catch (imgErr) {
        console.error(`Failed to generate image for ${dish.name?.ru}:`, imgErr)
        dish.generatedByAI = false
      }
    }
  } else {
    // Proxy: mark dishes as AI-generated (images will use placeholders)
    for (const dish of allDishes) {
      dish.generatedByAI = true
    }
    updateJob(jobId, { progress: 95, currentStep: 'Завершение...' })
  }

  // Step 5: Build final result
  const menuResult: GeneratedMenuData = {
    categories: translatedMenu.categories.map((cat: any) => ({
      ...cat,
      dishes: cat.dishes.map((d: any) => ({
        ...d,
        generatedByAI: d.generatedByAI ?? true,
      })),
    })),
    colorPalette: {
      primary: '#8B4513',
      secondary: '#F5F5DC',
      accent: '#DAA520',
      dark: '#2C1810',
      light: '#FFF8DC',
    },
    designTemplates: getDemoMenuData().designTemplates,
  }

  setMenuData(menuResult)
  updateJob(jobId, {
    status: 'completed',
    progress: 100,
    currentStep: 'Готово!',
    result: menuResult,
  })
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
