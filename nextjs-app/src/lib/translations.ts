// DeepL and Google Translate API integration

// DeepL supported languages for Pro/Premium/LUXE
const DEEPL_LANGUAGES = [
  'AR', 'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'ES', 'ET', 'FI',
  'FR', 'HU', 'ID', 'IT', 'JA', 'KO', 'LT', 'LV', 'NB', 'NL',
  'PL', 'PT', 'RO', 'RU', 'SK', 'SL', 'SV', 'TR', 'UK', 'ZH',
  'HY', // Armenian (added by DeepL recently)
]

export async function translateWithDeepL(
  text: string,
  targetLang: string,
  sourceLang: string = 'RU'
): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) throw new Error('DEEPL_API_KEY not configured')

  const targetCode = targetLang.toUpperCase()
  if (!DEEPL_LANGUAGES.includes(targetCode)) {
    // Fall back to Google Translate for unsupported languages
    return translateWithGoogle(text, targetLang, sourceLang)
  }

  const response = await fetch('https://api.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetCode,
      source_lang: sourceLang.toUpperCase(),
    }),
  })

  if (!response.ok) {
    throw new Error(`DeepL API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.translations?.[0]?.text || text
}

export async function translateWithGoogle(
  text: string,
  targetLang: string,
  sourceLang: string = 'ru'
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  if (!apiKey) throw new Error('GOOGLE_TRANSLATE_API_KEY not configured')

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        source: sourceLang,
        format: 'text',
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data?.translations?.[0]?.translatedText || text
}

export async function translateDish(
  dish: {
    name: string
    description?: string
  },
  targetLang: string,
  useDeepL: boolean = false,
  sourceLang: string = 'ru'
): Promise<{ name: string; description?: string }> {
  const translateFn = useDeepL ? translateWithDeepL : translateWithGoogle

  const [name, description] = await Promise.all([
    translateFn(dish.name, targetLang, sourceLang),
    dish.description ? translateFn(dish.description, targetLang, sourceLang) : Promise.resolve(undefined),
  ])

  return { name, description }
}

export async function translateMenu(
  items: Array<{ id: string; name: string; description?: string }>,
  targetLang: string,
  useDeepL: boolean = false,
  sourceLang: string = 'ru'
): Promise<Record<string, { name: string; description?: string }>> {
  const results: Record<string, { name: string; description?: string }> = {}

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await Promise.all(
      batch.map(async (item) => {
        results[item.id] = await translateDish(item, targetLang, useDeepL, sourceLang)
      })
    )
    // Small delay between batches
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return results
}
