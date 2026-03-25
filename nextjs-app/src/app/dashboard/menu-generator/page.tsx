'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Upload,
  Camera,
  X,
  Sparkles,
  CheckCircle2,
  Loader2,
  FileImage,
  Zap,
  ArrowRight,
  Image as ImageIcon,
  Languages,
  Palette,
  ChefHat,
} from 'lucide-react'

type Step = 'upload' | 'processing' | 'done'

interface UploadedFile {
  id: string
  file: File
  preview: string
}

export default function MenuGeneratorPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [photos, setPhotos] = useState<UploadedFile[]>([])
  const [logo, setLogo] = useState<UploadedFile | null>(null)
  const [restaurantName, setRestaurantName] = useState({ ru: '', en: '', hy: '' })
  const [cuisineType, setCuisineType] = useState('')

  // Processing state
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [jobStatus, setJobStatus] = useState('')

  const [dragOver, setDragOver] = useState(false)

  // Handle file selection
  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, 15 - photos.length)
    const newFiles: UploadedFile[] = fileArray
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      }))
    setPhotos(prev => [...prev, ...newFiles].slice(0, 15))
  }, [photos.length])

  const handleLogoFile = useCallback((files: FileList | File[]) => {
    const file = Array.from(files).find(f => f.type.startsWith('image/'))
    if (file) {
      setLogo({
        id: `logo-${Date.now()}`,
        file,
        preview: URL.createObjectURL(file),
      })
    }
  }, [])

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const removed = prev.find(p => p.id === id)
      if (removed) URL.revokeObjectURL(removed.preview)
      return prev.filter(p => p.id !== id)
    })
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }
  const handleDragLeave = () => setDragOver(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  // Convert files to base64 for API
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Start generation
  const startGeneration = async () => {
    setStep('processing')
    setProgress(0)
    setCurrentStep('Подготовка файлов...')

    try {
      // Convert photos to base64
      const photoBase64 = await Promise.all(photos.map(p => fileToBase64(p.file)))
      const logoBase64 = logo ? await fileToBase64(logo.file) : ''

      const response = await fetch('/api/menu/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: photoBase64,
          logo: logoBase64,
          restaurantInfo: {
            name: restaurantName,
            cuisineType,
          },
        }),
      })

      const data = await response.json()
      if (data.jobId) {
        setJobId(data.jobId)
      } else {
        throw new Error(data.error || 'Failed to start generation')
      }
    } catch (error) {
      console.error('Generation error:', error)
      setCurrentStep('Ошибка при запуске генерации')
    }
  }

  // Poll for job status
  useEffect(() => {
    if (!jobId || step !== 'processing') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/menu/generate/${jobId}/status`)
        const data = await res.json()

        setProgress(data.progress || 0)
        setCurrentStep(data.currentStep || '')
        setJobStatus(data.status || '')

        if (data.status === 'completed') {
          clearInterval(interval)
          setStep('done')
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setCurrentStep(`Ошибка: ${data.error || 'Unknown error'}`)
        }
      } catch (err) {
        console.error('Status poll error:', err)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [jobId, step])

  // Processing steps UI data
  const processingSteps = [
    { id: 'ocr', label: 'OCR распознавание текста', icon: Camera, threshold: 10 },
    { id: 'structuring', label: 'Структурирование меню', icon: ChefHat, threshold: 40 },
    { id: 'translating', label: 'Перевод RU / EN / HY', icon: Languages, threshold: 55 },
    { id: 'generating_images', label: 'Генерация фото блюд', icon: ImageIcon, threshold: 75 },
    { id: 'completed', label: 'Готово!', icon: CheckCircle2, threshold: 100 },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-violet-500" />
          AI Генерация меню
        </h1>
        <p className="text-gray-500 mt-1">
          Загрузите фото бумажного меню — AI создаст цифровое меню с переводом и фотографиями блюд
        </p>
      </div>

      {/* How it works banner */}
      {step === 'upload' && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-5">
          <h3 className="font-semibold text-violet-900 mb-3">Как это работает:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { icon: '📸', title: 'Загрузите фото', desc: 'До 15 фотографий меню' },
              { icon: '🤖', title: 'AI обработка', desc: 'OCR + структурирование' },
              { icon: '🌐', title: 'Автоперевод', desc: 'RU / EN / HY' },
              { icon: '🍽️', title: 'Фото блюд', desc: 'AI-генерация изображений' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-sm font-medium text-violet-900">{s.title}</div>
                <div className="text-xs text-violet-600">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-6">
          {/* Photo Upload Area */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Camera className="w-5 h-5 text-violet-500" />
                Фотографии меню <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Загрузите от 1 до 15 фотографий бумажного меню (JPG, PNG, HEIC)
              </p>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'
                }`}
              >
                <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-violet-500' : 'text-gray-400'}`} />
                <p className="font-medium text-gray-700">
                  Перетащите файлы сюда или <span className="text-violet-600 underline">выберите</span>
                </p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG, HEIC до 15 файлов</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && handleFiles(e.target.files)}
                />
              </div>

              {/* Photo previews */}
              {photos.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Загружено: {photos.length}/15
                    </span>
                    <button
                      onClick={() => {
                        photos.forEach(p => URL.revokeObjectURL(p.preview))
                        setPhotos([])
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Удалить все
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.preview}
                          alt="Menu photo"
                          className="w-full aspect-square object-cover rounded-xl border border-gray-200"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); removePhoto(photo.id) }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-lg truncate text-center">
                            {photo.file.name}
                          </div>
                        </div>
                      </div>
                    ))}
                    {photos.length < 15 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors"
                      >
                        <FileImage className="w-6 h-6" />
                        <span className="text-xs">Ещё</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Palette className="w-5 h-5 text-violet-500" />
                Логотип ресторана
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Загрузите логотип для анализа цветовой палитры и подбора дизайна
              </p>

              <div className="flex items-center gap-4">
                {logo ? (
                  <div className="relative">
                    <img
                      src={logo.preview}
                      alt="Logo"
                      className="w-20 h-20 object-contain rounded-xl border-2 border-violet-200 bg-white p-1"
                    />
                    <button
                      onClick={() => { URL.revokeObjectURL(logo.preview); setLogo(null) }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-violet-400 hover:text-violet-500 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Логотип</span>
                  </button>
                )}
                <div className="text-sm text-gray-500">
                  PNG, JPG, SVG до 5MB.<br />
                  AI подберёт цветовую палитру и дизайн по логотипу.
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files && handleLogoFile(e.target.files)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Restaurant Info */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-violet-500" />
                Информация о ресторане
              </h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Название (RU)</label>
                    <input
                      type="text"
                      value={restaurantName.ru}
                      onChange={e => setRestaurantName(prev => ({ ...prev, ru: e.target.value }))}
                      placeholder="Ресторан Арарат"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Name (EN)</label>
                    <input
                      type="text"
                      value={restaurantName.en}
                      onChange={e => setRestaurantName(prev => ({ ...prev, en: e.target.value }))}
                      placeholder="Ararat Restaurant"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Անուն (HY)</label>
                    <input
                      type="text"
                      value={restaurantName.hy}
                      onChange={e => setRestaurantName(prev => ({ ...prev, hy: e.target.value }))}
                      placeholder="Արարատ ռեստորան"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Тип кухни</label>
                  <select
                    value={cuisineType}
                    onChange={e => setCuisineType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Выберите тип кухни</option>
                    <option value="armenian">Армянская</option>
                    <option value="european">Европейская</option>
                    <option value="asian">Азиатская</option>
                    <option value="italian">Итальянская</option>
                    <option value="mixed">Смешанная</option>
                    <option value="other">Другая</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={startGeneration}
            disabled={photos.length === 0}
            className="w-full h-14 text-base bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl shadow-lg disabled:opacity-50"
          >
            <Zap className="w-5 h-5 mr-2" />
            Сгенерировать меню ({photos.length} {photos.length === 1 ? 'фото' : 'фото'})
          </Button>
        </div>
      )}

      {/* STEP 2: Processing */}
      {step === 'processing' && (
        <Card className="border-violet-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-violet-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">AI создаёт ваше меню</h2>
              <p className="text-gray-500">{currentStep}</p>
            </div>

            {/* Progress bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Прогресс</span>
                <span className="text-sm font-bold text-violet-600">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step indicators */}
            <div className="max-w-md mx-auto space-y-3">
              {processingSteps.map((ps) => {
                const isDone = progress >= ps.threshold
                const isActive = !isDone && progress >= (ps.threshold - 30)
                return (
                  <div
                    key={ps.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isDone ? 'bg-green-50 text-green-700' :
                      isActive ? 'bg-violet-50 text-violet-700' :
                      'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                    ) : (
                      <ps.icon className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">{ps.label}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Done */}
      {step === 'done' && (
        <Card className="border-green-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Меню готово!</h2>
              <p className="text-gray-500">
                AI создал структурированное меню с переводом на 3 языка и фотографиями блюд.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              {[
                { icon: '📝', label: 'Категории', value: 'Автоматически' },
                { icon: '🌐', label: 'Языки', value: 'RU / EN / HY' },
                { icon: '📷', label: 'Фото блюд', value: 'AI-сгенерированы' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Button
                onClick={() => router.push('/dashboard/menu-editor')}
                className="flex-1 h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Открыть редактор меню
              </Button>
              <Button
                onClick={() => { setStep('upload'); setPhotos([]); setLogo(null); setJobId(null) }}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                Загрузить заново
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
