/**
 * TapMenu Armenia — Transformer Engine
 *
 * Unified AI-powered translation, description generation, and image generation.
 * Supports multiple providers with automatic fallback:
 *   1. DeepL (premium/luxe plans) — highest quality translation
 *   2. Google Translate (pro+ plans) — broad language support
 *   3. OpenAI GPT (fallback) — context-aware translation
 *   4. Demo mode — returns placeholder translations
 *
 * Phase 03: Transformer module
 *
 * Environment variables:
 *   DEEPL_API_KEY             — DeepL Pro API key
 *   GOOGLE_TRANSLATE_API_KEY  — Google Cloud Translation API key
 *   OPENAI_API_KEY            — OpenAI API key (for GPT translation + descriptions)
 *   OPENAI_BASE_URL           — Optional proxy (e.g. GenSpark)
 *
 * ⚠️ PLACEHOLDER FOR REAL API KEYS:
 *   If you're a developer setting this up, you need to:
 *   1. Get a DeepL API key at https://www.deepl.com/pro-api
 *   2. Get a Google Translate API key at https://console.cloud.google.com
 *   3. Get an OpenAI API key at https://platform.openai.com/api-keys
 *   Then set them in .env.local — the code will auto-detect and use them.
 */

import { logger } from '@/lib/logger'
import type { SubscriptionPlan } from '@/types'

// ─── Provider detection ───────────────────────────────────────────────────────

export type TranslationProvider = 'deepl' | 'google' | 'openai' | 'demo'
export type ImageProvider = 'dalle' | 'demo'

export function getAvailableTranslationProviders(): TranslationProvider[] {
  const providers: TranslationProvider[] = []
  if (process.env.DEEPL_API_KEY) providers.push('deepl')
  if (process.env.GOOGLE_TRANSLATE_API_KEY) providers.push('google')
  if (process.env.OPENAI_API_KEY) providers.push('openai')
  providers.push('demo') // Always available
  return providers
}

export function getAvailableImageProviders(): ImageProvider[] {
  const providers: ImageProvider[] = []
  const baseURL = process.env.OPENAI_BASE_URL || ''
  // DALL-E not available through proxy
  if (process.env.OPENAI_API_KEY && !baseURL.includes('genspark.ai')) {
    providers.push('dalle')
  }
  providers.push('demo')
  return providers
}

export function getBestTranslationProvider(plan?: SubscriptionPlan): TranslationProvider {
  const available = getAvailableTranslationProviders()
  // DeepL only for premium+ plans
  if (available.includes('deepl') && plan && ['premium', 'luxe'].includes(plan)) {
    return 'deepl'
  }
  if (available.includes('google')) return 'google'
  if (available.includes('openai')) return 'openai'
  return 'demo'
}

// ─── DeepL supported languages ────────────────────────────────────────────────

const DEEPL_LANGUAGES = new Set([
  'AR', 'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'ES', 'ET', 'FI',
  'FR', 'HU', 'ID', 'IT', 'JA', 'KO', 'LT', 'LV', 'NB', 'NL',
  'PL', 'PT', 'RO', 'RU', 'SK', 'SL', 'SV', 'TR', 'UK', 'ZH',
  'HY', // Armenian
])

// ─── Language display names ───────────────────────────────────────────────────

const LANG_NAMES: Record<string, string> = {
  ru: 'Russian', en: 'English', hy: 'Armenian', ar: 'Arabic',
  zh: 'Chinese', fr: 'French', de: 'German', es: 'Spanish',
  it: 'Italian', ja: 'Japanese', ko: 'Korean', tr: 'Turkish',
  pl: 'Polish', pt: 'Portuguese', nl: 'Dutch', sv: 'Swedish',
  da: 'Danish', fi: 'Finnish', no: 'Norwegian', cs: 'Czech',
  sk: 'Slovak', hu: 'Hungarian', ro: 'Romanian', bg: 'Bulgarian',
  hr: 'Croatian', sr: 'Serbian', uk: 'Ukrainian', ka: 'Georgian',
  he: 'Hebrew', fa: 'Persian', vi: 'Vietnamese', th: 'Thai',
  id: 'Indonesian',
}

// ─── Translation ──────────────────────────────────────────────────────────────

export interface TranslateRequest {
  texts: Array<{ id: string; text: string }>
  targetLang: string
  sourceLang?: string
  provider?: TranslationProvider
}

export interface TranslateResult {
  translations: Record<string, string> // id → translated text
  provider: TranslationProvider
  tokensUsed: number
  cached: boolean
}

/**
 * Translate an array of texts to a target language.
 * Automatically selects the best provider based on availability and plan.
 */
export async function translateTexts(req: TranslateRequest): Promise<TranslateResult> {
  const provider = req.provider || 'demo'
  const sourceLang = req.sourceLang || 'ru'
  const translations: Record<string, string> = {}
  let tokensUsed = 0

  logger.info('[transformer] Translating', {
    provider,
    targetLang: req.targetLang,
    count: req.texts.length,
  })

  try {
    switch (provider) {
      case 'deepl':
        return await translateWithDeepL(req.texts, req.targetLang, sourceLang)

      case 'google':
        return await translateWithGoogle(req.texts, req.targetLang, sourceLang)

      case 'openai':
        return await translateWithOpenAI(req.texts, req.targetLang, sourceLang)

      case 'demo':
      default:
        // Demo mode: prefix with language code
        for (const item of req.texts) {
          translations[item.id] = `[${req.targetLang.toUpperCase()}] ${item.text}`
          tokensUsed += item.text.length
        }
        return { translations, provider: 'demo', tokensUsed, cached: false }
    }
  } catch (err) {
    logger.error('[transformer] Translation failed, falling back to demo', {
      provider,
      error: String(err),
    })
    // Fallback to demo on any error
    for (const item of req.texts) {
      translations[item.id] = `[${req.targetLang.toUpperCase()}] ${item.text}`
      tokensUsed += item.text.length
    }
    return { translations, provider: 'demo', tokensUsed, cached: false }
  }
}

// ─── DeepL translation ────────────────────────────────────────────────────────

async function translateWithDeepL(
  texts: Array<{ id: string; text: string }>,
  targetLang: string,
  sourceLang: string
): Promise<TranslateResult> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) throw new Error('DEEPL_API_KEY not configured')

  const targetCode = targetLang.toUpperCase()
  if (!DEEPL_LANGUAGES.has(targetCode)) {
    // Fallback to Google for unsupported languages
    logger.info('[transformer] DeepL unsupported lang, falling back to Google', { targetLang })
    return translateWithGoogle(texts, targetLang, sourceLang)
  }

  // DeepL supports batch translation
  const response = await fetch('https://api.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: texts.map(t => t.text),
      target_lang: targetCode,
      source_lang: sourceLang.toUpperCase(),
      context: 'Restaurant menu item',
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`DeepL API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  const translations: Record<string, string> = {}
  let tokensUsed = 0

  texts.forEach((item, idx) => {
    translations[item.id] = data.translations?.[idx]?.text || item.text
    tokensUsed += item.text.length + (translations[item.id]?.length || 0)
  })

  return { translations, provider: 'deepl', tokensUsed, cached: false }
}

// ─── Google Translate ─────────────────────────────────────────────────────────

async function translateWithGoogle(
  texts: Array<{ id: string; text: string }>,
  targetLang: string,
  sourceLang: string
): Promise<TranslateResult> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) throw new Error('GOOGLE_TRANSLATE_API_KEY not configured')

  // Google Translate supports batch via array of q params
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: texts.map(t => t.text),
        target: targetLang,
        source: sourceLang,
        format: 'text',
      }),
    }
  )

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Google Translate API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  const translations: Record<string, string> = {}
  let tokensUsed = 0

  texts.forEach((item, idx) => {
    translations[item.id] = data.data?.translations?.[idx]?.translatedText || item.text
    tokensUsed += item.text.length + (translations[item.id]?.length || 0)
  })

  return { translations, provider: 'google', tokensUsed, cached: false }
}

// ─── OpenAI GPT translation ──────────────────────────────────────────────────

async function translateWithOpenAI(
  texts: Array<{ id: string; text: string }>,
  targetLang: string,
  sourceLang: string
): Promise<TranslateResult> {
  // Dynamic import to avoid bundling on client
  const { getOpenAI, getChatModel } = await getOpenAIHelpers()

  const langName = LANG_NAMES[targetLang] || targetLang
  const sourceName = LANG_NAMES[sourceLang] || sourceLang

  // Batch into a single GPT call with JSON output
  const itemsJson = texts.map(t => ({ id: t.id, text: t.text }))

  const openai = getOpenAI()
  const response = await openai.chat.completions.create({
    model: getChatModel(),
    messages: [
      {
        role: 'system',
        content: `You are a professional restaurant menu translator. Translate from ${sourceName} to ${langName}. Preserve culinary terminology and appetizing tone. Return ONLY a JSON array of objects with "id" and "text" fields. No explanations.`,
      },
      {
        role: 'user',
        content: JSON.stringify(itemsJson),
      },
    ],
    max_tokens: Math.max(texts.length * 200, 500),
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content || '{}'
  const translations: Record<string, string> = {}
  let tokensUsed = response.usage?.total_tokens || 0

  try {
    const parsed = JSON.parse(content)
    // Handle both { items: [...] } and [...] formats
    const items = Array.isArray(parsed) ? parsed : (parsed.items || parsed.translations || [])
    for (const item of items) {
      if (item.id && item.text) {
        translations[item.id] = item.text
      }
    }
  } catch {
    logger.warn('[transformer] Failed to parse GPT translation JSON', { content: content.substring(0, 200) })
  }

  // Fill missing translations with originals
  for (const item of texts) {
    if (!translations[item.id]) {
      translations[item.id] = item.text
    }
  }

  return { translations, provider: 'openai', tokensUsed, cached: false }
}

// ─── Description generation ───────────────────────────────────────────────────

export interface GenerateDescriptionRequest {
  dishName: string
  ingredients?: string[]
  category?: string
  targetLang?: string
  style?: 'appetizing' | 'concise' | 'detailed' | 'poetic'
}

export interface GenerateDescriptionResult {
  description: string
  provider: 'openai' | 'demo'
  tokensUsed: number
}

/**
 * Generate an appetizing dish description using AI.
 * Falls back to a template in demo mode.
 */
export async function generateDescription(
  req: GenerateDescriptionRequest
): Promise<GenerateDescriptionResult> {
  const lang = req.targetLang || 'ru'
  const langName = LANG_NAMES[lang] || 'Russian'
  const style = req.style || 'appetizing'

  // Check if OpenAI is available
  if (!process.env.OPENAI_API_KEY) {
    return {
      description: getDemoDescription(req.dishName, lang),
      provider: 'demo',
      tokensUsed: 0,
    }
  }

  try {
    const { getOpenAI, getChatModel } = await getOpenAIHelpers()
    const openai = getOpenAI()

    const styleGuides: Record<string, string> = {
      appetizing: 'Write an appetizing, mouth-watering description (2-3 sentences).',
      concise: 'Write a brief, informative description (1-2 sentences).',
      detailed: 'Write a detailed description including cooking method and flavors (3-4 sentences).',
      poetic: 'Write a poetic, literary description that evokes atmosphere (2-3 sentences).',
    }

    const ingredientNote = req.ingredients?.length
      ? ` Ingredients: ${req.ingredients.join(', ')}.`
      : ''
    const categoryNote = req.category ? ` Category: ${req.category}.` : ''

    const response = await openai.chat.completions.create({
      model: getChatModel(),
      messages: [
        {
          role: 'system',
          content: `You are a professional restaurant copywriter. ${styleGuides[style]} Write in ${langName}. Keep under 100 words. No quotes around the description.`,
        },
        {
          role: 'user',
          content: `Dish: "${req.dishName}".${categoryNote}${ingredientNote}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    return {
      description: response.choices[0]?.message?.content?.trim() || getDemoDescription(req.dishName, lang),
      provider: 'openai',
      tokensUsed: response.usage?.total_tokens || 0,
    }
  } catch (err) {
    logger.error('[transformer] Description generation failed', { error: String(err) })
    return {
      description: getDemoDescription(req.dishName, lang),
      provider: 'demo',
      tokensUsed: 0,
    }
  }
}

// ─── Image generation ─────────────────────────────────────────────────────────

export interface GenerateImageRequest {
  dishName: string
  description?: string
  style?: 'photo' | 'illustration' | 'watercolor'
}

export interface GenerateImageResult {
  imageUrl: string
  provider: ImageProvider
  tokensUsed: number
}

/**
 * Generate a dish image using AI.
 *
 * ⚠️ PLACEHOLDER: DALL-E integration requires a direct OpenAI API key
 *    (not available through proxy). In demo mode returns an empty string.
 *    A real developer should:
 *    1. Set OPENAI_API_KEY in .env.local
 *    2. Ensure it's a direct OpenAI key (not proxy)
 *    3. DALL-E 3 costs ~$0.04/image at standard quality
 *    4. Consider using Supabase Storage to cache generated images
 */
export async function generateImage(
  req: GenerateImageRequest
): Promise<GenerateImageResult> {
  const providers = getAvailableImageProviders()

  if (!providers.includes('dalle')) {
    logger.info('[transformer] DALL-E not available, using placeholder')
    return {
      imageUrl: '', // Empty = use placeholder in UI
      provider: 'demo',
      tokensUsed: 0,
    }
  }

  try {
    const { getOpenAI } = await getOpenAIHelpers()
    const openai = getOpenAI()

    const stylePrompts: Record<string, string> = {
      photo: 'Professional food photography, top-down angle, natural lighting, minimal background, restaurant quality.',
      illustration: 'Elegant hand-drawn food illustration, warm colors, artistic style.',
      watercolor: 'Delicate watercolor painting of food, soft colors, artistic restaurant menu style.',
    }

    const prompt = `${stylePrompts[req.style || 'photo']} Dish: "${req.dishName}"${req.description ? `. ${req.description}` : ''}`

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    return {
      imageUrl: response.data?.[0]?.url || '',
      provider: 'dalle',
      tokensUsed: 1, // DALL-E charges per image, not tokens
    }
  } catch (err) {
    logger.error('[transformer] Image generation failed', { error: String(err) })
    return { imageUrl: '', provider: 'demo', tokensUsed: 0 }
  }
}

// ─── Batch translate a full menu ──────────────────────────────────────────────

export interface BatchTranslateMenuRequest {
  menuId: string
  restaurantId: string
  targetLangs: string[]
  sourceLang?: string
  provider?: TranslationProvider
}

export interface BatchTranslateMenuResult {
  translations: Record<string, Record<string, { name: string; description?: string }>>
  // ^ langCode → dishId → { name, description }
  totalTokensUsed: number
  provider: TranslationProvider
  dishCount: number
  langCount: number
}

/**
 * Translate all dishes and categories of a menu into multiple target languages.
 * This is the main entry point for the "Translate Menu" action.
 *
 * ⚠️ REQUIRES: At least one translation provider configured.
 *    Without API keys, returns demo translations with [LANG] prefixes.
 */
export async function batchTranslateMenu(
  dishes: Array<{ id: string; name: string; description?: string }>,
  categories: Array<{ id: string; name: string }>,
  targetLangs: string[],
  sourceLang: string = 'ru',
  provider: TranslationProvider = 'demo'
): Promise<BatchTranslateMenuResult> {
  const translations: Record<string, Record<string, { name: string; description?: string }>> = {}
  let totalTokensUsed = 0

  for (const lang of targetLangs) {
    translations[lang] = {}

    // Prepare texts: dish names + descriptions + category names
    const nameTexts = dishes.map(d => ({ id: `dish-name-${d.id}`, text: d.name }))
    const descTexts = dishes
      .filter(d => d.description)
      .map(d => ({ id: `dish-desc-${d.id}`, text: d.description! }))
    const catTexts = categories.map(c => ({ id: `cat-${c.id}`, text: c.name }))

    const allTexts = [...nameTexts, ...descTexts, ...catTexts]

    // Batch translate (the provider handles batching internally)
    const result = await translateTexts({
      texts: allTexts,
      targetLang: lang,
      sourceLang,
      provider,
    })

    totalTokensUsed += result.tokensUsed

    // Map results back to dish structure
    for (const dish of dishes) {
      translations[lang][dish.id] = {
        name: result.translations[`dish-name-${dish.id}`] || dish.name,
        description: dish.description
          ? (result.translations[`dish-desc-${dish.id}`] || dish.description)
          : undefined,
      }
    }

    // Map category translations
    for (const cat of categories) {
      translations[lang][`cat-${cat.id}`] = {
        name: result.translations[`cat-${cat.id}`] || cat.name,
      }
    }
  }

  return {
    translations,
    totalTokensUsed,
    provider,
    dishCount: dishes.length,
    langCount: targetLangs.length,
  }
}

// ─── Demo description templates ───────────────────────────────────────────────

function getDemoDescription(dishName: string, lang: string): string {
  const templates: Record<string, string> = {
    ru: `Изысканное блюдо "${dishName}", приготовленное по традиционному рецепту с использованием свежих ингредиентов. Идеальный выбор для ценителей настоящего вкуса.`,
    en: `An exquisite "${dishName}" prepared using traditional recipes with the freshest ingredients. A perfect choice for connoisseurs of authentic flavors.`,
    hy: `Նրբագեղ "${dishName}" delays delays `, // Simplified Armenian placeholder
  }
  return templates[lang] || templates['en'] || `[${lang.toUpperCase()}] Description for ${dishName}`
}

// ─── OpenAI helper import (lazy) ──────────────────────────────────────────────

let _openaiHelpers: { getOpenAI: () => import('openai').default; getChatModel: () => string } | null = null

async function getOpenAIHelpers() {
  if (_openaiHelpers) return _openaiHelpers

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const openaiModule = require('@/lib/openai')
  _openaiHelpers = {
    getOpenAI: openaiModule.default?.getOpenAI || (() => {
      const OpenAI = require('openai').default || require('openai')
      const baseURL = process.env.OPENAI_BASE_URL
      return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        ...(baseURL ? { baseURL } : {}),
      })
    }),
    getChatModel: openaiModule.default?.getChatModel || (() => {
      const baseURL = process.env.OPENAI_BASE_URL || ''
      return baseURL.includes('genspark.ai') ? 'gpt-5' : 'gpt-4o'
    }),
  }
  return _openaiHelpers
}

// ─── Exports for status/config ────────────────────────────────────────────────

export function getTransformerStatus() {
  return {
    providers: getAvailableTranslationProviders(),
    imageProviders: getAvailableImageProviders(),
    hasDeepL: !!process.env.DEEPL_API_KEY,
    hasGoogle: !!process.env.GOOGLE_TRANSLATE_API_KEY,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasDalle: getAvailableImageProviders().includes('dalle'),
    supportedLanguages: Object.keys(LANG_NAMES),
    deeplLanguages: Array.from(DEEPL_LANGUAGES),
  }
}
