// TypeScript types for TapMenu Armenia SaaS

export type UserRole = 'owner' | 'admin' | 'superadmin'
export type SubscriptionPlan = 'starter' | 'pro' | 'premium' | 'luxe'
export type SubscriptionStatus = 'trial' | 'active' | 'grace' | 'blocked' | 'cancelled'
export type DishStatus = 'active' | 'inactive' | 'archived'
export type MenuStatus = 'active' | 'inactive' | 'draft'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  avatarUrl?: string
  isEmailVerified: boolean
  mustChangePassword: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Restaurant {
  id: string
  userId: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  coverUrl?: string
  address?: string
  city?: string
  country: string
  phone?: string
  website?: string
  wifiName?: string
  primaryColor: string
  accentColor: string
  templateId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  isYearly: boolean
  trialEndsAt?: Date
  currentPeriodEnd?: Date
  graceEndsAt?: Date
  maxMenus: number
  maxDishes: number
  maxLanguages: number
  maxNfcTags: number
  createdAt: Date
  updatedAt: Date
}

export interface Dish {
  id: string
  restaurantId: string
  name: string
  nameTranslations?: Record<string, string>
  description?: string
  descriptionTranslations?: Record<string, string>
  price: number // AMD
  imageUrl?: string
  imageUrlMd?: string
  imageUrlSm?: string
  calories?: number
  proteins?: number
  fats?: number
  carbohydrates?: number
  weight?: number
  spicyLevel: number // 0-3
  isVegan: boolean
  isGlutenFree: boolean
  allergens: string[]
  tags: string[]
  status: DishStatus
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Menu {
  id: string
  restaurantId: string
  name: string
  description?: string
  status: MenuStatus
  isDefault: boolean
  languages: string[]
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  categories?: Category[]
}

export interface Category {
  id: string
  menuId: string
  name: string
  nameTranslations?: Record<string, string>
  emoji?: string
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  dishes?: MenuDish[]
}

export interface MenuDish {
  id: string
  menuId: string
  dishId: string
  categoryId?: string
  sortOrder: number
  isAvailable: boolean
  specialPrice?: number
  dish?: Dish
}

export interface Table {
  id: string
  restaurantId: string
  name: string
  nfcTagId?: string
  qrCode?: string
  isActive: boolean
  createdAt: Date
}

export interface MenuView {
  id: string
  restaurantId: string
  tableId?: string
  lang: string
  device?: string
  country?: string
  city?: string
  viewedAt: Date
}

export interface ExchangeRate {
  id: string
  fromCurrency: string
  toCurrency: string
  rate: number
  updatedAt: Date
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  restaurantName?: string
  message?: string
  source?: string
  isProcessed: boolean
  createdAt: Date
}

// Tariff plan limits
export const PLAN_LIMITS: Record<SubscriptionPlan, {
  maxMenus: number
  maxDishes: number
  maxLanguages: number
  maxNfcTags: number
  hasAnalytics: boolean
  hasAi: boolean
  hasDeepL: boolean
  hasCustomTemplate: boolean
  priceMonthly: number
  priceYearly: number
}> = {
  starter: {
    maxMenus: 1,
    maxDishes: 30,
    maxLanguages: 2,
    maxNfcTags: 1,
    hasAnalytics: false,
    hasAi: false,
    hasDeepL: false,
    hasCustomTemplate: false,
    priceMonthly: 15,
    priceYearly: 12,
  },
  pro: {
    maxMenus: 3,
    maxDishes: 100,
    maxLanguages: 5,
    maxNfcTags: 5,
    hasAnalytics: true,
    hasAi: false,
    hasDeepL: false,
    hasCustomTemplate: false,
    priceMonthly: 25,
    priceYearly: 20,
  },
  premium: {
    maxMenus: 10,
    maxDishes: 500,
    maxLanguages: 20,
    maxNfcTags: 20,
    hasAnalytics: true,
    hasAi: false,
    hasDeepL: true,
    hasCustomTemplate: true,
    priceMonthly: 45,
    priceYearly: 36,
  },
  luxe: {
    maxMenus: -1, // unlimited
    maxDishes: -1,
    maxLanguages: 33,
    maxNfcTags: -1,
    hasAnalytics: true,
    hasAi: true,
    hasDeepL: true,
    hasCustomTemplate: true,
    priceMonthly: 50,
    priceYearly: 40,
  },
}

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
]

export const CURRENCIES = [
  { code: 'AMD', symbol: '֏', name: 'Армянский драм' },
  { code: 'USD', symbol: '$', name: 'Доллар США' },
  { code: 'EUR', symbol: '€', name: 'Евро' },
  { code: 'RUB', symbol: '₽', name: 'Российский рубль' },
  { code: 'GBP', symbol: '£', name: 'Фунт стерлингов' },
]

export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}
