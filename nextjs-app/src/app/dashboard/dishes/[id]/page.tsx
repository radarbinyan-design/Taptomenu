'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Check,
  X,
  Save,
  Upload,
  Globe,
  Flame,
  Scale,
  Sparkles,
  Eye,
  EyeOff,
  ChevronDown,
  Camera,
  Tag,
  Leaf,
  Wheat,
  AlertTriangle,
  Plus,
  Trash2,
  Languages,
  Info,
} from 'lucide-react'

const CATEGORIES = ['Горячие блюда', 'Холодные закуски', 'Салаты', 'Супы', 'Напитки', 'Десерты', 'Хлеб и выпечка', 'Алкоголь']

const ALLERGENS = [
  { id: 'gluten', label: 'Глютен', emoji: '🌾' },
  { id: 'dairy', label: 'Лактоза', emoji: '🥛' },
  { id: 'nuts', label: 'Орехи', emoji: '🥜' },
  { id: 'eggs', label: 'Яйца', emoji: '🥚' },
  { id: 'fish', label: 'Рыба', emoji: '🐟' },
  { id: 'shellfish', label: 'Морепродукты', emoji: '🦐' },
  { id: 'soy', label: 'Соя', emoji: '🌿' },
  { id: 'sesame', label: 'Кунжут', emoji: '✨' },
]

const TAGS = ['#хит', '#новинка', '#сезонное', '#острое', '#лёгкое', '#популярное', '#шеф рекомендует', '#вегетарианское']

const EMOJIS = ['🥩', '🥗', '🫑', '🍖', '🥛', '🍷', '🫓', '🍰', '🥘', '🍲', '🫒', '🧄', '🥦', '🍋', '🍯', '🌶', '🐟', '🍤', '🥩', '🧀', '🫙', '🍵', '☕', '🍸']

interface Translation {
  lang: string
  langName: string
  flag: string
  name: string
  description: string
  isAI?: boolean
}

const INITIAL_TRANSLATIONS: Translation[] = [
  { lang: 'ru', langName: 'Русский', flag: '🇷🇺', name: '', description: '' },
  { lang: 'en', langName: 'English', flag: '🇬🇧', name: '', description: '' },
  { lang: 'hy', langName: 'Հայերեն', flag: '🇦🇲', name: '', description: '' },
  { lang: 'ar', langName: 'العربية', flag: '🇸🇦', name: '', description: '' },
]

export default function DishEditorPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new'

  // Basic info
  const [dishName, setDishName] = useState(isNew ? '' : 'Хоровац из баранины')
  const [description, setDescription] = useState(isNew ? '' : 'Традиционное армянское блюдо на углях. Баранина маринуется в специях и запекается до золотистой корочки.')
  const [price, setPrice] = useState(isNew ? '' : '4800')
  const [specialPrice, setSpecialPrice] = useState(isNew ? '' : '')
  const [category, setCategory] = useState(isNew ? CATEGORIES[0] : 'Горячие блюда')
  const [weight, setWeight] = useState(isNew ? '' : '350')
  const [calories, setCalories] = useState(isNew ? '' : '485')
  const [emoji, setEmoji] = useState(isNew ? '🍽' : '🥩')
  const [status, setStatus] = useState<'active' | 'hidden'>('active')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Dietary
  const [isVegan, setIsVegan] = useState(false)
  const [isVegetarian, setIsVegetarian] = useState(false)
  const [isGlutenFree, setIsGlutenFree] = useState(!isNew)
  const [isHalal, setIsHalal] = useState(false)
  const [spicyLevel, setSpicyLevel] = useState(isNew ? 0 : 1)
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>(isNew ? [] : ['#хит', '#популярное'])

  // Photo
  const [photoUrl, setPhotoUrl] = useState(isNew ? '' : '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Translations
  const [translations, setTranslations] = useState<Translation[]>(INITIAL_TRANSLATIONS)
  const [generatingAI, setGeneratingAI] = useState(false)

  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'translations' | 'nutrition'>('basic')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saved, setSaved] = useState(false)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = () => {
    if (!dishName.trim()) {
      showToast('Введите название блюда', 'error')
      return
    }
    if (!price || Number(price) <= 0) {
      showToast('Введите корректную цену', 'error')
      return
    }
    setSaved(true)
    showToast(`${isNew ? 'Блюдо создано' : 'Блюдо сохранено'}!`)
    setTimeout(() => setSaved(false), 2500)
  }

  const toggleAllergen = (id: string) => {
    setSelectedAllergens(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoUrl(url)
      showToast('Фото загружено!')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPhotoUrl(url)
      showToast('Фото загружено!')
    }
  }

  const generateAITranslations = async () => {
    if (!dishName.trim()) {
      showToast('Сначала введите название блюда', 'error')
      return
    }
    setGeneratingAI(true)

    // Simulate AI generation
    await new Promise(r => setTimeout(r, 1800))

    const aiTranslations: Partial<Record<string, { name: string; description: string }>> = {
      en: {
        name: dishName === 'Хоровац из баранины' ? 'Lamb Khorovats' : `${dishName} (EN)`,
        description: 'Traditional Armenian dish cooked over charcoal. Lamb marinated in spices and grilled to golden perfection.',
      },
      hy: {
        name: dishName === 'Хоровац из баранины' ? 'Գառան խորոված' : `${dishName} (HY)`,
        description: 'Ավանդական հայկական ուտեստ, պատրաստված կրակի վրա։ Գառան մսը մարինացվում է համեմունքներով։',
      },
      ar: {
        name: dishName === 'Хоровац из баранины' ? 'خروفاتس الحمل' : `${dishName} (AR)`,
        description: 'طبق أرمني تقليدي مطبوخ على الفحم. يُتبَّل لحم الحمل بالتوابل ويُشوى حتى يصبح ذهبي اللون.',
      },
    }

    setTranslations(prev => prev.map(t => {
      const aiData = aiTranslations[t.lang]
      if (!aiData) return t
      return { ...t, name: aiData.name, description: aiData.description, isAI: true }
    }))

    setGeneratingAI(false)
    showToast('AI перевёл блюдо на 3 языка!')
  }

  const updateTranslation = (lang: string, field: 'name' | 'description', value: string) => {
    setTranslations(prev => prev.map(t =>
      t.lang === lang ? { ...t, [field]: value, isAI: false } : t
    ))
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/dishes" className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {isNew ? '+ Создать блюдо' : `✏️ ${dishName || 'Редактировать блюдо'}`}
          </h1>
          <p className="text-sm text-gray-500">{category}</p>
        </div>
        <button
          onClick={() => setStatus(s => s === 'active' ? 'hidden' : 'active')}
          className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
            status === 'active' ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'
          }`}
        >
          {status === 'active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {status === 'active' ? 'Активно' : 'Скрыто'}
        </button>
        <Button
          onClick={handleSave}
          className={`${saved ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'} text-white`}
        >
          {saved ? <><Check className="w-4 h-4 mr-1.5" />Сохранено!</> : <><Save className="w-4 h-4 mr-1.5" />Сохранить</>}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([
          { id: 'basic', label: '📋 Основное' },
          { id: 'translations', label: '🌍 Переводы' },
          { id: 'nutrition', label: '🥗 Питание' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BASIC TAB */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          {/* Photo upload */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Фото блюда</p>
            <div className="flex gap-4">
              {/* Preview */}
              <div
                className={`w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors ${
                  isDragging ? 'border-amber-400 bg-amber-50' : photoUrl ? 'border-gray-200' : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Dish" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-300">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-4xl">{emoji}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 h-9 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Загрузить фото
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                {photoUrl && (
                  <button
                    onClick={() => setPhotoUrl('')}
                    className="w-full flex items-center justify-center gap-2 h-9 border border-red-200 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить фото
                  </button>
                )}
                <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500">
                  JPG, PNG до 5MB. Оптимальный размер: 800×600px.
                  Будет обработано в 3 разрешениях.
                </div>
              </div>
            </div>

            {/* Emoji selector */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Эмоджи (если нет фото)</p>
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-2 h-9 px-3 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  <span className="text-xl">{emoji}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-10 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 flex flex-wrap gap-1 w-64">
                    {EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => { setEmoji(e); setShowEmojiPicker(false) }}
                        className={`w-9 h-9 text-xl rounded-lg hover:bg-amber-50 transition-colors ${emoji === e ? 'bg-amber-100' : ''}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main info */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Название блюда (RU) *</label>
                <Input
                  value={dishName}
                  onChange={e => setDishName(e.target.value)}
                  placeholder="Например: Хоровац из баранины"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Описание (RU)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Краткое описание блюда..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Цена (AMD) *</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="2500"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">֏</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Спец. цена</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={specialPrice}
                      onChange={e => setSpecialPrice(e.target.value)}
                      placeholder="2000"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">֏</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Категория</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Dietary flags */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Диетические особенности</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { key: 'vegan', label: '🌱 Веган', value: isVegan, set: setIsVegan },
                { key: 'vegetarian', label: '🥬 Вегетарианское', value: isVegetarian, set: setIsVegetarian },
                { key: 'glutenFree', label: '🌾 Без глютена', value: isGlutenFree, set: setIsGlutenFree },
                { key: 'halal', label: '☪️ Халяль', value: isHalal, set: setIsHalal },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => item.set(!item.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors ${
                    item.value ? 'border-green-300 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.value && <Check className="w-3.5 h-3.5 text-green-600" />}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Spicy level */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Острота</p>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map(level => (
                  <button
                    key={level}
                    onClick={() => setSpicyLevel(level)}
                    className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${
                      spicyLevel === level
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {level === 0 ? 'Не острое' : '🌶'.repeat(level)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Allergens */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Аллергены
            </p>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map(a => (
                <button
                  key={a.id}
                  onClick={() => toggleAllergen(a.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    selectedAllergens.includes(a.id)
                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {a.emoji} {a.label}
                  {selectedAllergens.includes(a.id) && <Check className="w-3 h-3 text-orange-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-blue-400" />
              Теги
            </p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {selectedTags.includes(tag) && <Check className="w-3 h-3 inline mr-1 text-blue-600" />}
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRANSLATIONS TAB */}
      {activeTab === 'translations' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-800">AI-перевод одним кликом</p>
              <p className="text-sm text-purple-700 mt-0.5">GPT-4o переведёт название и описание на EN, HY, AR автоматически</p>
            </div>
            <Button
              onClick={generateAITranslations}
              disabled={generatingAI || !dishName.trim()}
              className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-4 shrink-0"
            >
              {generatingAI ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Перевожу...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Перевод
                </span>
              )}
            </Button>
          </div>

          {translations.map(t => (
            <div key={t.lang} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{t.flag}</span>
                <span className="font-semibold text-gray-900 text-sm">{t.langName}</span>
                {t.isAI && (
                  <Badge className="text-xs bg-purple-100 text-purple-700">
                    <Sparkles className="w-3 h-3 mr-1 inline" /> AI
                  </Badge>
                )}
                {t.lang === 'ar' && (
                  <Badge className="text-xs bg-gray-100 text-gray-500 ml-auto">RTL</Badge>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  value={t.name}
                  onChange={e => updateTranslation(t.lang, 'name', e.target.value)}
                  placeholder={`Название на ${t.langName}`}
                  dir={t.lang === 'ar' ? 'rtl' : 'ltr'}
                  className={t.isAI ? 'border-purple-200 bg-purple-50/30' : ''}
                />
                <textarea
                  value={t.description}
                  onChange={e => updateTranslation(t.lang, 'description', e.target.value)}
                  placeholder={`Описание на ${t.langName}`}
                  rows={2}
                  dir={t.lang === 'ar' ? 'rtl' : 'ltr'}
                  className={`w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    t.isAI ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NUTRITION TAB */}
      {activeTab === 'nutrition' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <p className="text-sm font-medium text-gray-700">Пищевая ценность (на порцию)</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Вес (г)', value: weight, setter: setWeight, placeholder: '350', icon: Scale },
                { label: 'Калории (ккал)', value: calories, setter: setCalories, placeholder: '485', icon: Flame },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-sm text-gray-600 block mb-1.5 flex items-center gap-1.5">
                    <f.icon className="w-3.5 h-3.5 text-gray-400" />
                    {f.label}
                  </label>
                  <Input
                    type="number"
                    value={f.value}
                    onChange={e => f.setter(e.target.value)}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Белки (г)', placeholder: '28' },
                { label: 'Жиры (г)', placeholder: '22' },
                { label: 'Углеводы (г)', placeholder: '8' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-gray-500 block mb-1.5">{f.label}</label>
                  <Input type="number" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              КБЖУ отображается на карточке блюда и в детальном просмотре. Помогает гостям с диетическими предпочтениями.
            </p>
          </div>
        </div>
      )}

      {/* Save button at bottom */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <Link href="/dashboard/dishes" className="text-sm text-gray-500 hover:text-gray-700">
          ← Вернуться к списку
        </Link>
        <Button
          onClick={handleSave}
          className={`${saved ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'} text-white px-8`}
        >
          {saved ? '✓ Сохранено!' : 'Сохранить блюдо'}
        </Button>
      </div>

      {/* Emoji picker overlay */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
      )}
    </div>
  )
}
