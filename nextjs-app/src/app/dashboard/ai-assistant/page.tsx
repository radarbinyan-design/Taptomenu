'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, Send, Sparkles, User, RefreshCw, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const DEMO_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '👋 Привет! Я AI-ассистент ресторана «Арарат». Я могу помочь гостям с выбором блюд, рассказать о составе, аллергенах, и порекомендовать напитки. Чем могу помочь?',
    timestamp: new Date(),
  },
]

const SUGGESTIONS = [
  'Что порекомендуешь на ужин для двоих?',
  'Есть ли вегетарианские блюда?',
  'Что входит в хоровац?',
  'Какое армянское вино лучше?',
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPlanLocked] = useState(false) // Set to true if not LUXE plan
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: 'Ресторан Арарат',
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.error || 'Извините, не удалось получить ответ.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Ошибка соединения. Пожалуйста, проверьте OPENAI_API_KEY в настройках.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (isPlanLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center p-8">
        <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-ассистент</h2>
        <p className="text-gray-500 mb-6 max-w-sm">
          AI-ассистент доступен только в тарифном плане LUXE. Обновите план, чтобы получить доступ к GPT-4o для ваших гостей.
        </p>
        <Button size="lg">
          <Sparkles className="w-5 h-5" />
          Перейти на LUXE
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-7 h-7 text-amber-500" />
            AI-ассистент
          </h1>
          <p className="text-gray-500 mt-1">Powered by GPT-4o · LUXE план</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Активен в публичном меню
          </span>
          <Button variant="outline" size="sm" onClick={() => setMessages(DEMO_MESSAGES)}>
            <RefreshCw className="w-4 h-4" />
            Сбросить
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col" style={{ height: '550px' }}>
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm">AI-ассистент «Арарат»</CardTitle>
                  <p className="text-xs text-gray-400">Как гость видит ассистента в меню</p>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                        : 'bg-gray-200'
                    }`}>
                      {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'assistant'
                        ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        : 'bg-amber-500 text-white rounded-tr-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Напишите вопрос о меню..."
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick questions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Популярные вопросы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="w-full text-left text-xs p-2.5 bg-gray-50 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors text-gray-600 border border-transparent hover:border-amber-200"
                >
                  {suggestion}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Диалогов сегодня', value: '23' },
                { label: 'Токенов использовано', value: '12,840' },
                { label: 'Средняя длина', value: '4.2 сообщения' },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{stat.label}</span>
                  <span className="font-medium text-gray-900">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Config note */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-700 font-medium mb-1">⚙️ Настройка</p>
            <p className="text-xs text-blue-600">
              Добавьте <span className="font-mono">OPENAI_API_KEY</span> в переменные окружения Vercel для активации.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
