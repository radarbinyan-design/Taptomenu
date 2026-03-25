'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Languages,
  Globe,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  Wand2,
  Image as ImageIcon,
  FileText,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Info,
  Upload,
  ScanLine,
  CheckCircle2,
  XCircle,
  Eye,
  Copy,
  ArrowRight,
  Settings2,
} from 'lucide-react'
import { useTransformer, useMenus, useDishes } from '@/hooks'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/shared/Toast'
import { SUPPORTED_LANGUAGES, type SubscriptionPlan } from '@/types'

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_MENUS = [
  { id: 'demo-1', name: 'Основное меню', languages: ['ru', 'en', 'hy'], dishCount: 24, catCount: 6 },
  { id: 'demo-2', name: 'Барная карта', languages: ['ru', 'en'], dishCount: 18, catCount: 4 },
]

const DEMO_DISHES = [
  { id: 'd1', name: 'Хоровац', description: 'Традиционный армянский шашлык на углях', hasTranslation: { en: true, hy: true, fr: false } },
  { id: 'd2', name: 'Долма', description: 'Виноградные листья с мясной начинкой', hasTranslation: { en: true, hy: true, fr: false } },
  { id: 'd3', name: 'Хаш', description: 'Наваристый бульон из говяжьих ног', hasTranslation: { en: false, hy: true, fr: false } },
  { id: 'd4', name: 'Лаваш с сырами', description: 'Свежий лаваш с ассорти армянских сыров', hasTranslation: { en: true, hy: false, fr: false } },
  { id: 'd5', name: 'Армянский кофе', description: null, hasTranslation: { en: false, hy: false, fr: false } },
  { id: 'd6', name: 'Гата', description: 'Армянская сладкая выпечка', hasTranslation: { en: true, hy: true, fr: false } },
  { id: 'd7', name: 'Бастурма', description: 'Вяленая говядина с пряностями', hasTranslation: { en: false, hy: false, fr: false } },
  { id: 'd8', name: 'Суджук', description: 'Острая сухая колбаса', hasTranslation: { en: false, hy: true, fr: false } },
]

const DEMO_USAGE = {
  totalTokens: 12840,
  totalRequests: 47,
  byType: {
    translation: { count: 32, tokensUsed: 9200 },
    description: { count: 12, tokensUsed: 3200 },
    image: { count: 3, tokensUsed: 440 },
  },
  byProvider: {
    demo: { count: 40, tokensUsed: 10000 },
    openai: { count: 7, tokensUsed: 2840 },
  },
  period: 30,
}

const PROVIDER_LABELS: Record<string, { label: string; color: string; badge: string }> = {
  deepl: { label: 'DeepL', color: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  google: { label: 'Google', color: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  openai: { label: 'GPT', color: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  dalle: { label: 'DALL-E', color: 'text-pink-700', badge: 'bg-pink-100 text-pink-700' },
  demo: { label: 'Демо', color: 'text-gray-500', badge: 'bg-gray-100 text-gray-500' },
  'gpt4-vision': { label: 'GPT-4V', color: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
  'google-vision': { label: 'Cloud Vision', color: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  tesseract: { label: 'Tesseract', color: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' },
}

const STYLE_OPTIONS = [
  { id: 'appetizing', label: 'Аппетитное', desc: '2-3 предложения, вызывающие аппетит' },
  { id: 'concise', label: 'Краткое', desc: '1-2 предложения, информативно' },
  { id: 'detailed', label: 'Подробное', desc: '3-4 предложения с деталями' },
  { id: 'poetic', label: 'Поэтичное', desc: '2-3 предложения, литературный стиль' },
] as const

// ─── Component ────────────────────────────────────────────────────────────────

export default function TranslationsPage() {
  const restaurant = useAuthStore(s => s.restaurant)
  const { toast } = useToast()
  const {
    usage: realUsage,
    transformerStatus,
    recentActivity,
    translateMenu,
    generateDescription,
    generateImage: generateDishImage,
    runOcr,
    isLoading,
    refetch,
  } = useTransformer(restaurant?.id)
  const { menus: realMenus } = useMenus(restaurant?.id)
  const { dishes: realDishes } = useDishes(restaurant?.id, { limit: 100 })

  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [selectedLangs, setSelectedLangs] = useState<string[]>([])
  const [translating, setTranslating] = useState(false)
  const [describing, setDescribing] = useState<string | null>(null)
  const [generatingImage, setGeneratingImage] = useState<string | null>(null)
  const [descStyle, setDescStyle] = useState<'appetizing' | 'concise' | 'detailed' | 'poetic'>('appetizing')
  const [descLang, setDescLang] = useState('ru')
  const [tab, setTab] = useState<'translate' | 'describe' | 'ocr' | 'usage'>('translate')
  const [showAllLangs, setShowAllLangs] = useState(false)
  const [ocrImageUrl, setOcrImageUrl] = useState('')
  const [ocrRunning, setOcrRunning] = useState(false)
  const [ocrResult, setOcrResult] = useState<{
    extractedText: string
    structuredData?: { categories: Array<{ name: string; dishes: Array<{ name: string; description?: string; price?: number }> }>; rawDishes: Array<{ name: string; description?: string; price?: number }> }
    confidence: number
    provider: string
  } | null>(null)
  const [generatedDescriptions, setGeneratedDescriptions] = useState<Record<string, string>>({})

  // Demo fallback
  const usage = realUsage || DEMO_USAGE
  const menus = realMenus?.length ? realMenus.map(m => ({
    id: m.id,
    name: m.name,
    languages: m.languages || ['ru'],
    dishCount: m._count?.menuDishes || 0,
    catCount: m._count?.categories || 0,
  })) : DEMO_MENUS

  // Use real dishes if available, otherwise demo
  const dishList = useMemo(() => {
    if (realDishes?.length) {
      return realDishes.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        hasTranslation: (d.nameTranslations || {}) as Record<string, boolean>,
      }))
    }
    return DEMO_DISHES
  }, [realDishes])

  const isDemo = !realUsage

  // Available languages (top used first)
  const topLanguages = useMemo(() => {
    const top = ['en', 'hy', 'ar', 'fr', 'de', 'zh', 'ja', 'tr', 'es', 'it', 'ko', 'pl']
    return SUPPORTED_LANGUAGES.filter(l => top.includes(l.code))
  }, [])

  const allLanguages = showAllLangs ? SUPPORTED_LANGUAGES : topLanguages

  // Toggle language selection
  const toggleLang = (code: string) => {
    setSelectedLangs(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    )
  }

  // ─── Actions ──────────────────────────────────────────────────────────

  const handleTranslate = async () => {
    if (!selectedMenu || selectedLangs.length === 0) {
      toast('Выберите меню и хотя бы один язык', 'error')
      return
    }
    setTranslating(true)
    try {
      const result = await translateMenu(selectedMenu, selectedLangs)
      toast(
        `Переведено: ${result.stats?.dishesTranslated || 0} блюд на ${selectedLangs.length} язык(ов). Провайдер: ${result.provider}`,
        'success'
      )
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка перевода', 'error')
    } finally {
      setTranslating(false)
    }
  }

  const handleDescribe = async (dishName: string, dishId: string) => {
    setDescribing(dishId)
    try {
      const result = await generateDescription(dishName, {
        dishId,
        save: true,
        style: descStyle,
        targetLang: descLang,
      })
      setGeneratedDescriptions(prev => ({ ...prev, [dishId]: result.description }))
      toast(
        `Описание сгенерировано (${result.provider}): "${result.description.substring(0, 60)}..."`,
        'success'
      )
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка генерации', 'error')
    } finally {
      setDescribing(null)
    }
  }

  const handleGenerateImage = async (dishName: string, dishId: string, description?: string | null) => {
    setGeneratingImage(dishId)
    try {
      const result = await generateDishImage(dishName, {
        dishId,
        description: description || undefined,
        style: 'photo',
        save: true,
      })
      if (result.imageUrl) {
        toast(`Изображение создано (${result.provider})`, 'success')
      } else {
        toast('Требуется настройка OPENAI_API_KEY для генерации изображений', 'info')
      }
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка генерации изображения', 'error')
    } finally {
      setGeneratingImage(null)
    }
  }

  const handleOcr = async () => {
    if (!ocrImageUrl.trim()) {
      toast('Введите URL изображения меню', 'error')
      return
    }
    setOcrRunning(true)
    setOcrResult(null)
    try {
      const result = await runOcr(ocrImageUrl.trim())
      setOcrResult(result)
      if (result.provider === 'demo') {
        toast('OCR в демо-режиме. Настройте OPENAI_API_KEY для реального распознавания.', 'info')
      } else {
        toast(`OCR завершён (${result.provider}): извлечено ${result.structuredData?.rawDishes?.length || 0} блюд`, 'success')
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Ошибка OCR', 'error')
    } finally {
      setOcrRunning(false)
    }
  }

  const handleDescribeAll = useCallback(async () => {
    const dishes = dishList.filter(d => !d.description)
    if (dishes.length === 0) {
      toast('Все блюда уже имеют описания', 'info')
      return
    }

    toast(`Генерация описаний для ${dishes.length} блюд...`, 'info')
    let success = 0
    for (const dish of dishes) {
      try {
        setDescribing(dish.id)
        const result = await generateDescription(dish.name, {
          dishId: dish.id,
          save: true,
          style: descStyle,
          targetLang: descLang,
        })
        setGeneratedDescriptions(prev => ({ ...prev, [dish.id]: result.description }))
        success++
      } catch {
        // Continue with next dish
      }
    }
    setDescribing(null)
    toast(`Описания сгенерированы: ${success}/${dishes.length}`, 'success')
    refetch()
  }, [dishList, generateDescription, descStyle, descLang, toast, refetch])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Переводы и контент</h1>
          <p className="text-gray-500 mt-1">Автоматический перевод меню, генерация описаний и OCR</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Обновить
        </Button>
      </div>

      {/* Provider status */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
        <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">Доступные провайдеры:</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {(transformerStatus?.providers || ['demo']).map(p => {
              const info = PROVIDER_LABELS[p] || PROVIDER_LABELS.demo
              return (
                <Badge key={p} className={`${info.badge} border-0 text-xs`}>
                  {info.label}
                </Badge>
              )
            })}
            {!transformerStatus?.hasDeepL && !transformerStatus?.hasGoogle && !transformerStatus?.hasOpenAI && (
              <span className="text-xs text-amber-600 ml-2">
                Настройте API-ключи в .env.local для реальных переводов
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Demo banner */}
      {isDemo && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Демо-режим</p>
            <p className="text-xs text-amber-600">
              Переводы работают с префиксом [LANG]. Подключите DeepL, Google Translate или OpenAI для реальных переводов.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {[
          { id: 'translate', label: 'Перевод меню', icon: Languages },
          { id: 'describe', label: 'AI Описания', icon: Wand2 },
          { id: 'ocr', label: 'OCR Импорт', icon: ScanLine },
          { id: 'usage', label: 'Статистика', icon: BarChart3 },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* ─── Translate tab ──────────────────────────────────────────────── */}
      {tab === 'translate' && (
        <div className="space-y-5">
          {/* Select menu */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">1. Выберите меню</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {menus.map(menu => (
                  <button
                    key={menu.id}
                    onClick={() => setSelectedMenu(menu.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedMenu === menu.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{menu.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {menu.dishCount} блюд · {menu.catCount} категорий
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {menu.languages.map(l => {
                        const lang = SUPPORTED_LANGUAGES.find(sl => sl.code === l)
                        return (
                          <span key={l} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                            {lang?.flag || l} {l.toUpperCase()}
                          </span>
                        )
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Select languages */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">2. Выберите языки перевода</CardTitle>
                <button
                  onClick={() => setShowAllLangs(!showAllLangs)}
                  className="flex items-center gap-1 text-xs text-amber-600 font-medium"
                >
                  {showAllLangs ? 'Меньше' : 'Все 33 языка'}
                  {showAllLangs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allLanguages.filter(l => l.code !== 'ru').map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLang(lang.code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      selectedLangs.includes(lang.code)
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-amber-200'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {selectedLangs.includes(lang.code) && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
              {selectedLangs.length > 0 && (
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-amber-600">
                    Выбрано: {selectedLangs.length} язык(ов)
                  </p>
                  <button
                    onClick={() => setSelectedLangs([])}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Очистить
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Translate button */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleTranslate}
              disabled={!selectedMenu || selectedLangs.length === 0 || translating}
              className="px-6"
            >
              {translating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Перевод...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1" /> Перевести меню</>
              )}
            </Button>
            {selectedMenu && selectedLangs.length > 0 && (
              <p className="text-sm text-gray-500">
                {menus.find(m => m.id === selectedMenu)?.dishCount || 0} блюд x {selectedLangs.length} язык(ов)
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Describe tab ───────────────────────────────────────────────── */}
      {tab === 'describe' && (
        <div className="space-y-4">
          {/* Settings bar */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Стиль:</span>
                  <div className="flex gap-1">
                    {STYLE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDescStyle(opt.id)}
                        title={opt.desc}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          descStyle === opt.id
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-amber-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Язык:</span>
                  <select
                    value={descLang}
                    onChange={(e) => setDescLang(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                  >
                    {SUPPORTED_LANGUAGES.slice(0, 12).map(l => (
                      <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                    ))}
                  </select>
                </div>
                <Button size="sm" variant="outline" onClick={handleDescribeAll} disabled={!!describing}>
                  <Wand2 className="w-3.5 h-3.5 mr-1" />
                  Сгенерировать все
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                Генерация описаний блюд
                <Badge className="bg-gray-100 text-gray-500 border-0 text-xs ml-2">
                  {dishList.length} блюд
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                AI создаст аппетитное описание для каждого блюда. Нажмите кнопку рядом с блюдом или &quot;Сгенерировать все&quot; для пакетной обработки.
              </p>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {dishList.map(dish => (
                  <div key={dish.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                      {generatedDescriptions[dish.id] ? (
                        <p className="text-xs text-green-600 mt-0.5 line-clamp-2">
                          <CheckCircle2 className="w-3 h-3 inline mr-1" />
                          {generatedDescriptions[dish.id]}
                        </p>
                      ) : dish.description ? (
                        <p className="text-xs text-gray-500 truncate mt-0.5">{dish.description}</p>
                      ) : (
                        <p className="text-xs text-amber-500 mt-0.5">Нет описания</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      {/* Translation badges */}
                      <div className="hidden sm:flex gap-1">
                        {Object.entries(dish.hasTranslation || {}).slice(0, 3).map(([lang, has]) => (
                          <span
                            key={lang}
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              has ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDescribe(dish.name, dish.id)}
                        disabled={describing === dish.id}
                        title="Сгенерировать описание"
                      >
                        {describing === dish.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateImage(dish.name, dish.id, dish.description)}
                        disabled={generatingImage === dish.id}
                        title="Сгенерировать изображение (DALL-E)"
                      >
                        {generatingImage === dish.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Image generation notice */}
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="pt-6 text-center">
              <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">AI Генерация изображений</p>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Требуется прямой OpenAI API-ключ с доступом к DALL-E 3. Стоимость: ~$0.04/изображение.
                Настройте OPENAI_API_KEY в .env.local для активации.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── OCR tab ─────────────────────────────────────────────────────── */}
      {tab === 'ocr' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-amber-400" />
                Импорт меню из фото (OCR)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Загрузите фотографию меню, и AI распознает блюда, цены и категории.
              </p>

              {/* Image URL input */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ocrImageUrl}
                    onChange={(e) => setOcrImageUrl(e.target.value)}
                    placeholder="URL изображения меню (https://... или Supabase Storage URL)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none"
                  />
                  <Button onClick={handleOcr} disabled={!ocrImageUrl.trim() || ocrRunning}>
                    {ocrRunning ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Распознаю...</>
                    ) : (
                      <><ScanLine className="w-4 h-4 mr-1" /> Распознать</>
                    )}
                  </Button>
                </div>

                {/* Upload hint */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Upload className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-600">
                    Загрузите фото в Supabase Storage через /dashboard/settings и вставьте полученный URL.
                    Или используйте прямую ссылку на изображение.
                  </p>
                </div>
              </div>

              {/* TODO notice */}
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">TODO: Реализация OCR-провайдера</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Для реального распознавания текста меню необходимо настроить один из провайдеров:
                    </p>
                    <ul className="text-xs text-amber-600 mt-2 space-y-1 list-disc list-inside">
                      <li><strong>GPT-4 Vision</strong> (рекомендуется) — OPENAI_API_KEY (прямой ключ)</li>
                      <li><strong>Google Cloud Vision</strong> — GOOGLE_CLOUD_VISION_API_KEY</li>
                      <li><strong>Tesseract.js</strong> — бесплатно, npm install tesseract.js</li>
                      <li><strong>Azure Document Intelligence</strong> — AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT</li>
                    </ul>
                    <p className="text-xs text-amber-600 mt-2">
                      Код-заглушка находится в <code className="bg-amber-100 px-1 rounded">src/app/api/transformer/ocr/route.ts</code>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OCR Results */}
          {ocrResult && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Результат распознавания
                    <Badge className={`${PROVIDER_LABELS[ocrResult.provider]?.badge || PROVIDER_LABELS.demo.badge} border-0 text-xs`}>
                      {PROVIDER_LABELS[ocrResult.provider]?.label || ocrResult.provider}
                    </Badge>
                  </CardTitle>
                  {ocrResult.confidence > 0 && (
                    <span className="text-xs text-gray-400">
                      Уверенность: {Math.round(ocrResult.confidence * 100)}%
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Structured data */}
                {ocrResult.structuredData?.categories && (
                  <div className="space-y-4 mb-4">
                    {ocrResult.structuredData.categories.map((cat, idx) => (
                      <div key={idx}>
                        <h4 className="text-sm font-bold text-gray-700 mb-2">{cat.name}</h4>
                        <div className="space-y-1.5">
                          {cat.dishes.map((dish, dIdx) => (
                            <div key={dIdx} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-800">{dish.name}</span>
                                {dish.description && (
                                  <span className="text-xs text-gray-400 ml-2">{dish.description}</span>
                                )}
                              </div>
                              {dish.price !== undefined && (
                                <span className="text-sm font-medium text-gray-700 ml-3">{dish.price.toLocaleString()} AMD</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Raw text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-gray-500">Извлечённый текст</h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ocrResult.extractedText)
                        toast('Текст скопирован', 'success')
                      }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-3 h-3" /> Копировать
                    </button>
                  </div>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                    {ocrResult.extractedText}
                  </pre>
                </div>

                {/* Action: import dishes */}
                {ocrResult.structuredData?.rawDishes && ocrResult.structuredData.rawDishes.length > 0 && (
                  <div className="mt-4 flex items-center gap-3">
                    <Button size="sm" variant="outline" disabled>
                      <ArrowRight className="w-3.5 h-3.5 mr-1" />
                      Импортировать {ocrResult.structuredData.rawDishes.length} блюд
                    </Button>
                    <span className="text-xs text-gray-400">
                      TODO: Автоматическое создание блюд через /api/dishes
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── Usage tab ──────────────────────────────────────────────────── */}
      {tab === 'usage' && (
        <div className="space-y-4">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Запросов', value: usage.totalRequests, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Токенов', value: usage.totalTokens.toLocaleString(), icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Переводов', value: usage.byType.translation?.count || 0, icon: Languages, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Описаний', value: usage.byType.description?.count || 0, icon: Wand2, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(kpi => (
              <Card key={kpi.label}>
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                      <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">{kpi.value}</div>
                      <div className="text-xs text-gray-400">{kpi.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage by provider */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Использование по провайдеру</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(usage.byProvider).map(([provider, data]) => {
                  const info = PROVIDER_LABELS[provider] || PROVIDER_LABELS.demo
                  const pct = usage.totalRequests > 0 ? (data.count / usage.totalRequests) * 100 : 0
                  return (
                    <div key={provider} className="flex items-center gap-3">
                      <Badge className={`${info.badge} border-0 text-xs w-16 justify-center`}>
                        {info.label}
                      </Badge>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all"
                            style={{ width: `${Math.max(pct, 3)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 w-24 text-right">
                        {data.count} запросов
                      </div>
                      <div className="text-xs text-gray-400 w-20 text-right">
                        {data.tokensUsed.toLocaleString()} ток.
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Usage by type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Использование по типу</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { type: 'translation', label: 'Переводы', icon: Languages, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { type: 'description', label: 'Описания', icon: Wand2, color: 'text-purple-500', bg: 'bg-purple-50' },
                  { type: 'image', label: 'Изображения', icon: ImageIcon, color: 'text-pink-500', bg: 'bg-pink-50' },
                  { type: 'ocr', label: 'OCR', icon: ScanLine, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                ].map(item => {
                  const data = usage.byType[item.type] || { count: 0, tokensUsed: 0 }
                  return (
                    <div key={item.type} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 ${item.bg} rounded-lg flex items-center justify-center`}>
                          <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{item.label}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">{data.count}</div>
                      <div className="text-xs text-gray-400">{data.tokensUsed.toLocaleString()} токенов</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Последняя активность</CardTitle>
            </CardHeader>
            <CardContent>
              {(recentActivity.length > 0 ? recentActivity : [
                { type: 'translation', provider: 'demo', tokensUsed: 450, createdAt: '2026-03-24T14:30:00Z' },
                { type: 'description', provider: 'openai', tokensUsed: 280, createdAt: '2026-03-24T13:15:00Z' },
                { type: 'translation', provider: 'demo', tokensUsed: 320, createdAt: '2026-03-24T11:00:00Z' },
              ]).slice(0, 10).map((activity, idx) => {
                const info = PROVIDER_LABELS[activity.provider] || PROVIDER_LABELS.demo
                return (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        activity.type === 'translation' ? 'bg-blue-50' :
                        activity.type === 'description' ? 'bg-purple-50' :
                        activity.type === 'ocr' ? 'bg-indigo-50' : 'bg-pink-50'
                      }`}>
                        {activity.type === 'translation' ? <Languages className="w-3.5 h-3.5 text-blue-500" /> :
                         activity.type === 'description' ? <FileText className="w-3.5 h-3.5 text-purple-500" /> :
                         activity.type === 'ocr' ? <ScanLine className="w-3.5 h-3.5 text-indigo-500" /> :
                         <ImageIcon className="w-3.5 h-3.5 text-pink-500" />}
                      </div>
                      <div>
                        <span className="text-sm text-gray-700 capitalize">{activity.type}</span>
                        <Badge className={`${info.badge} border-0 text-xs ml-2`}>{info.label}</Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {activity.tokensUsed} токенов
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
