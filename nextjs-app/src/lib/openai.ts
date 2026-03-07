import OpenAI from 'openai'

// Note: openai package should be installed separately
// npm install openai

let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

export async function generateMenuDescription(
  dishName: string,
  ingredients: string[],
  lang: string = 'ru'
): Promise<string> {
  const openai = getOpenAI()
  
  const langNames: Record<string, string> = {
    ru: 'Russian', en: 'English', hy: 'Armenian', fr: 'French', de: 'German',
  }
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a professional restaurant copywriter. Write appetizing, concise dish descriptions in ${langNames[lang] || 'English'}.`,
      },
      {
        role: 'user',
        content: `Write a 2-3 sentence description for "${dishName}" dish with ingredients: ${ingredients.join(', ')}. Keep it under 100 words, appetizing and professional.`,
      },
    ],
    max_tokens: 150,
    temperature: 0.7,
  })

  return response.choices[0]?.message?.content || ''
}

export async function translateDishContent(
  content: string,
  targetLang: string,
  sourceLang: string = 'ru'
): Promise<string> {
  const openai = getOpenAI()
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Translate restaurant menu content from ${sourceLang} to ${targetLang}. Preserve the culinary style and appetizing tone. Return ONLY the translation, no explanations.`,
      },
      {
        role: 'user',
        content: content,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  })

  return response.choices[0]?.message?.content || content
}

export async function aiMenuAssistant(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  restaurantName: string,
  restaurantType?: string
): Promise<string> {
  const openai = getOpenAI()
  
  const systemPrompt = `You are an AI assistant for the restaurant "${restaurantName}"${restaurantType ? ` (${restaurantType})` : ''}. 
Help guests with menu questions, dish recommendations, allergen information, and special requests.
Be friendly, helpful, and respond in the same language as the guest.
If you don't know specific information, say so politely and offer to get help from staff.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 500,
    temperature: 0.7,
  })

  return response.choices[0]?.message?.content || 'Извините, я не смог обработать ваш запрос.'
}

export async function generateDishImage(
  dishName: string,
  description?: string
): Promise<string> {
  const openai = getOpenAI()
  
  const prompt = `Professional food photography of "${dishName}"${description ? `. ${description}` : ''}. 
High-quality restaurant menu photo, top-down or 45-degree angle, natural lighting, minimal background.`

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  })

  return response.data?.[0]?.url || ''
}
