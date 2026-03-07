'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Globe,
  Upload,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Check,
  Flame,
  Leaf,
  Wheat,
} from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
]

const CATEGORIES = ['Закуски', 'Салаты', 'Супы', 'Горячее', 'Гарниры', 'Десерты', 'Напитки', 'Хлеб']
const ALLERGENS = ['Молоко', 'Яйца', 'Глютен', 'Орехи', 'Рыба', 'Морепродукты', 'Сульфиты', 'Соя', 'Арахис', 'Кунжут']

export default function NewDishPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    weight: '',
    calories: '',
    isVegan: false,
    isGlutenFree: false,
    spicyLevel: 0,
    allergens: [] as string[],
    tags: '',
  })

  const [translations, setTranslations] = useState<Record<string, { name: string; description: string }>>({})
  const [activeTab, setActiveTab] = useState<'basic' | 'translations' | 'nutritions'>('basic')
  const [aiLoading, setAiLoading] = useState(false)
  const [savedLangs, setSavedLangs] = useState<string[]>([])

  const handleAiTranslate = async (lang: string) => {
    if (!form.name) return
    setAiLoading(true)
    // Simulate AI translation
    await new Promise((r) => setTimeout(r, 800))
    const mockTranslations: Record<string, Record<string, { name: string; description: string }>> = {
      en: {
        'Хоровац из ягнёнка': { name: 'Lamb Khorovats', description: 'Traditional Armenian charcoal-grilled lamb kebab' },
        default: { name: form.name + ' (EN)', description: form.description + ' (translated)' },
      },
      hy: {
        default: { name: form.name + ' (ՀՅ)', description: form.description + ' (թարգմ.)' },
      },
      ar: {
        default: { name: form.name + ' (AR)', description: form.description + ' (مترجم)' },
      },
    }
    const t = mockTranslations[lang]?.default || { name: form.name, description: form.description }
    setTranslations((prev) => ({ ...prev, [lang]: t }))
    setSavedLangs((prev) => [...prev.filter((l) => l !== lang), lang])
    setAiLoading(false)
  }

  const toggleAllergen = (allergen: string) => {
    setForm((prev) => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter((a) => a !== allergen)
        : [...prev.allergens, allergen],
    }))
  }

  const tabs = [
    { id: 'basic', label: 'Основное' },
    { id: 'translations', label: 'Переводы', badge: savedLangs.length > 0 ? savedLangs.length : undefined },
    { id: 'nutritions', label: 'Нутриция' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/dishes"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Добавить блюдо</h1>
          <p className="text-sm text-gray-500">Библиотека блюд</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Отмена</Button>
          <Button>
            <Save className="w-4 h-4" />
            Сохранить блюдо
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Basic */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Image upload */}
            <Card className="lg:row-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Фото блюда</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-amber-400 hover:bg-amber-50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-600">Загрузить фото</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG до 5MB</p>
                  <p className="text-xs text-gray-400">Рекомендуется: 800×600px</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Выбрать файл
                  </Button>
                </div>

                {/* Emoji fallback */}
                <div className="mt-4">
                  <label className="text-xs font-medium text-gray-500 block mb-2">Эмодзи (если нет фото)</label>
                  <div className="flex gap-2 flex-wrap">
                    {['🍖', '🥗', '🍝', '🍜', '🥩', '🫑', '🍷', '🫓', '🍰', '🥘'].map((emoji) => (
                      <button
                        key={emoji}
                        className="text-xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Name */}
            <Card>
              <CardContent className="pt-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Название на русском <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Например: Хоровац из ягнёнка"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </CardContent>
            </Card>

            {/* Category + Price */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">Категория</label>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
                      >
                        <option value="">Выберите...</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Цена (֏) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                      placeholder="2500"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="pt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Краткое описание блюда для гостей..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </CardContent>
          </Card>

          {/* Dietary tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Диетические метки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setForm((p) => ({ ...p, isVegan: !p.isVegan }))}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${form.isVegan ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isVegan ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <Leaf className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">Vegan</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setForm((p) => ({ ...p, isGlutenFree: !p.isGlutenFree }))}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${form.isGlutenFree ? 'bg-blue-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isGlutenFree ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <Wheat className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Без глютена</span>
                </label>

                <div className="flex items-center gap-2 ml-4">
                  <Flame className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-700">Острота:</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((level) => (
                      <button
                        key={level}
                        onClick={() => setForm((p) => ({ ...p, spicyLevel: level }))}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-colors ${
                          form.spicyLevel === level ? 'bg-red-100 text-red-600 font-bold' : 'bg-gray-100 text-gray-400 hover:bg-red-50'
                        }`}
                      >
                        {level === 0 ? '—' : '🌶'.repeat(level)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Allergens */}
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Аллергены</div>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map((allergen) => (
                    <button
                      key={allergen}
                      onClick={() => toggleAllergen(allergen)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        form.allergens.includes(allergen)
                          ? 'bg-orange-50 border-orange-300 text-orange-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300'
                      }`}
                    >
                      {form.allergens.includes(allergen) && <span className="mr-1">✓</span>}
                      {allergen}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Translations */}
      {activeTab === 'translations' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">AI Переводчик</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Нажмите «AI перевод» для автоматического перевода названия и описания на выбранный язык.
                Вы можете отредактировать перевод после.
              </p>
            </div>
          </div>

          {LANGUAGES.map((lang) => (
            <Card key={lang.code}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{lang.flag}</span>
                    <CardTitle className="text-sm">{lang.name}</CardTitle>
                    {savedLangs.includes(lang.code) && (
                      <Badge variant="success" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Переведено
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAiTranslate(lang.code)}
                    disabled={!form.name || aiLoading}
                    className="text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI перевод
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Название</label>
                  <input
                    type="text"
                    value={translations[lang.code]?.name || ''}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        [lang.code]: { ...prev[lang.code], name: e.target.value },
                      }))
                    }
                    placeholder={`Название на ${lang.name}...`}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Описание</label>
                  <textarea
                    value={translations[lang.code]?.description || ''}
                    onChange={(e) =>
                      setTranslations((prev) => ({
                        ...prev,
                        [lang.code]: { ...prev[lang.code], description: e.target.value },
                      }))
                    }
                    placeholder={`Описание на ${lang.name}...`}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Nutritions */}
      {activeTab === 'nutritions' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Вес и калорийность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Вес (г)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                    placeholder="250"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Калории (ккал)</label>
                  <input
                    type="number"
                    value={form.calories}
                    onChange={(e) => setForm((p) => ({ ...p, calories: e.target.value }))}
                    placeholder="320"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Теги для поиска</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                placeholder="armenian, traditional, grilled (через запятую)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-gray-400 mt-2">Теги помогают гостям быстрее найти блюдо</p>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">Pro функция: AI нутриция</p>
              <p className="text-xs text-blue-600 mt-0.5">
                AI автоматически рассчитает КБЖУ на основе названия и ингредиентов блюда.
                Доступно в тарифе Pro и выше.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between z-10 lg:left-64">
        <div className="text-sm text-gray-500">
          {form.name ? (
            <span>Блюдо: <strong className="text-gray-900">{form.name}</strong></span>
          ) : (
            <span className="text-gray-400">Название блюда не указано</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/dishes">
            <Button variant="outline" size="sm">Отмена</Button>
          </Link>
          <Button size="sm" disabled={!form.name || !form.price}>
            <Save className="w-4 h-4" />
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  )
}
