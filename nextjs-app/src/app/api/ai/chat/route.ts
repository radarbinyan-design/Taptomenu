import { NextRequest, NextResponse } from 'next/server'
import { aiMenuAssistant } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, messages, restaurantName } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    // Check if restaurant has LUXE plan
    // TODO: Verify subscription

    const reply = await aiMenuAssistant(messages, restaurantName || 'Ресторан')

    // Save conversation to DB
    if (restaurantId) {
      await prisma.aiConversation.create({
        data: {
          restaurantId,
          userId: 'guest',
          messages,
          tokensUsed: reply.length / 4, // Rough estimate
        },
      }).catch(() => {}) // Don't fail if DB not ready
    }

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('AI assistant error:', error)
    return NextResponse.json(
      { error: 'AI ассистент временно недоступен' },
      { status: 503 }
    )
  }
}
