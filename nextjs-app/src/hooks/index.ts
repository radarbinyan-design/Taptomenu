/**
 * TapMenu Armenia — Domain API hooks
 *
 * Thin wrappers around useApi for each entity.
 * Each hook encapsulates URL building, type safety, and CRUD operations.
 *
 * Phase 02: Used by dashboard pages to replace hardcoded demo data.
 */

'use client'

import { useCallback } from 'react'
import { useApi, useMutation } from './useApi'
import { useAuthStore } from '@/stores/auth'

// ─── Types (match API responses) ─────────────────────────────────────────────

export interface ApiDish {
  id: string
  restaurantId: string
  name: string
  nameTranslations: Record<string, string> | null
  description: string | null
  descriptionTranslations: Record<string, string> | null
  price: number
  imageUrl: string | null
  imageUrlMd: string | null
  imageUrlSm: string | null
  calories: number | null
  proteins: number | null
  fats: number | null
  carbohydrates: number | null
  weight: number | null
  spicyLevel: number
  isVegan: boolean
  isGlutenFree: boolean
  allergens: string[]
  tags: string[]
  status: 'active' | 'inactive' | 'archived'
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ApiMenu {
  id: string
  restaurantId: string
  name: string
  description: string | null
  status: 'active' | 'inactive' | 'draft'
  isDefault: boolean
  languages: string[]
  sortOrder: number
  createdAt: string
  updatedAt: string
  categories?: ApiCategory[]
  _count?: { categories: number; menuDishes: number }
}

export interface ApiCategory {
  id: string
  menuId: string
  name: string
  nameTranslations: Record<string, string> | null
  emoji: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  menuDishes?: Array<{ dish: ApiDish; sortOrder: number; isAvailable: boolean }>
}

export interface ApiTable {
  id: string
  restaurantId: string
  name: string
  nfcTagId: string | null
  qrCode: string | null
  isActive: boolean
  createdAt: string
  _count?: { menuViews: number }
}

export interface ApiRestaurant {
  id: string
  userId: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  coverUrl: string | null
  address: string | null
  city: string | null
  country: string
  phone: string | null
  website: string | null
  wifiName: string | null
  primaryColor: string
  accentColor: string
  templateId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: { dishes: number; menus: number; tables: number }
}

export interface ApiMenuView {
  language: string
  device: string | null
  _count: number
  date?: string
}

// ─── Paginated response shape ────────────────────────────────────────────────

interface PaginatedDishes {
  dishes: ApiDish[]
  total: number
  page: number
  totalPages: number
}

interface PaginatedTables {
  tables: ApiTable[]
  total: number
}

// ─── Restaurant hook ─────────────────────────────────────────────────────────

export function useRestaurant(restaurantId?: string | null) {
  const url = restaurantId ? `/api/restaurants/${restaurantId}` : null
  return useApi<ApiRestaurant>(url)
}

export function useMyRestaurant() {
  // Fetch first restaurant for current user
  const result = useApi<{ restaurants: ApiRestaurant[] }>('/api/restaurants')
  const restaurant = result.data?.restaurants?.[0] ?? null
  return { ...result, restaurant }
}

// ─── Dishes hook ─────────────────────────────────────────────────────────────

export function useDishes(restaurantId?: string | null, params?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const qs = new URLSearchParams()
  if (restaurantId) qs.set('restaurantId', restaurantId)
  if (params?.status) qs.set('status', params.status)
  if (params?.search) qs.set('search', params.search)
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))

  const url = restaurantId ? `/api/dishes?${qs.toString()}` : null
  const result = useApi<PaginatedDishes>(url, {
    deps: [params?.status, params?.search, params?.page],
  })

  const createDish = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, restaurantId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create dish')
      return json as ApiDish
    },
    [restaurantId]
  )

  const updateDish = useCallback(
    async (dishId: string, body: Record<string, unknown>) => {
      const res = await fetch(`/api/dishes/${dishId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update dish')
      return json as ApiDish
    },
    []
  )

  const deleteDish = useCallback(async (dishId: string) => {
    const res = await fetch(`/api/dishes/${dishId}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.error || 'Failed to delete dish')
    }
  }, [])

  return {
    ...result,
    dishes: result.data?.dishes ?? [],
    total: result.data?.total ?? 0,
    totalPages: result.data?.totalPages ?? 0,
    createDish,
    updateDish,
    deleteDish,
  }
}

// ─── Menus hook ──────────────────────────────────────────────────────────────

export function useMenus(restaurantId?: string | null) {
  const url = restaurantId ? `/api/menus?restaurantId=${restaurantId}` : null
  const result = useApi<{ menus: ApiMenu[] }>(url)

  const createMenu = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, restaurantId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create menu')
      return json as ApiMenu
    },
    [restaurantId]
  )

  const updateMenu = useCallback(
    async (menuId: string, body: Record<string, unknown>) => {
      const res = await fetch(`/api/menus/${menuId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update menu')
      return json as ApiMenu
    },
    []
  )

  const deleteMenu = useCallback(async (menuId: string) => {
    const res = await fetch(`/api/menus/${menuId}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.error || 'Failed to delete menu')
    }
  }, [])

  return {
    ...result,
    menus: result.data?.menus ?? [],
    createMenu,
    updateMenu,
    deleteMenu,
  }
}

// ─── Categories hook ─────────────────────────────────────────────────────────

export function useCategories(menuId?: string | null) {
  const url = menuId ? `/api/categories?menuId=${menuId}` : null
  const result = useApi<{ categories: ApiCategory[] }>(url)

  const createCategory = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, menuId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create category')
      return json as ApiCategory
    },
    [menuId]
  )

  const updateCategory = useCallback(
    async (catId: string, body: Record<string, unknown>) => {
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update category')
      return json as ApiCategory
    },
    []
  )

  const deleteCategory = useCallback(async (catId: string) => {
    const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.error || 'Failed to delete category')
    }
  }, [])

  return {
    ...result,
    categories: result.data?.categories ?? [],
    createCategory,
    updateCategory,
    deleteCategory,
  }
}

// ─── Tables hook ─────────────────────────────────────────────────────────────

export function useTables(restaurantId?: string | null) {
  const url = restaurantId ? `/api/tables?restaurantId=${restaurantId}` : null
  const result = useApi<{ tables: ApiTable[] }>(url)

  const createTable = useCallback(
    async (body: Record<string, unknown>) => {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, restaurantId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create table')
      return json as ApiTable
    },
    [restaurantId]
  )

  const updateTable = useCallback(
    async (tableId: string, body: Record<string, unknown>) => {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update table')
      return json as ApiTable
    },
    []
  )

  const deleteTable = useCallback(async (tableId: string) => {
    const res = await fetch(`/api/tables/${tableId}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json().catch(() => ({}))
      throw new Error(json.error || 'Failed to delete table')
    }
  }, [])

  return {
    ...result,
    tables: result.data?.tables ?? [],
    createTable,
    updateTable,
    deleteTable,
  }
}

// ─── Menu Views (Analytics) hook ─────────────────────────────────────────────

export function useMenuViews(restaurantId?: string | null, params?: {
  period?: 'day' | 'week' | 'month'
  groupBy?: 'language' | 'device' | 'day'
}) {
  const qs = new URLSearchParams()
  if (restaurantId) qs.set('restaurantId', restaurantId)
  if (params?.period) qs.set('period', params.period)
  if (params?.groupBy) qs.set('groupBy', params.groupBy)

  const url = restaurantId ? `/api/menu-views?${qs.toString()}` : null
  return useApi<{ views: ApiMenuView[]; total: number }>(url, {
    deps: [params?.period, params?.groupBy],
  })
}

// ─── Transformer (Phase 03) hook ────────────────────────────────────────────

export interface TransformerUsageResponse {
  usage: {
    totalTokens: number
    totalRequests: number
    byType: Record<string, { count: number; tokensUsed: number }>
    byProvider: Record<string, { count: number; tokensUsed: number }>
    period: number
  }
  status: {
    providers: string[]
    imageProviders: string[]
    hasDeepL: boolean
    hasGoogle: boolean
    hasOpenAI: boolean
    hasDalle: boolean
  }
  recentActivity: Array<{
    type: string
    provider: string
    tokensUsed: number
    createdAt: string
  }>
}

export function useTransformer(restaurantId?: string | null) {
  const url = restaurantId ? `/api/transformer/usage?restaurantId=${restaurantId}` : null
  const result = useApi<TransformerUsageResponse>(url)

  const translateMenu = useCallback(
    async (menuId: string, targetLangs: string[], sourceLang = 'ru', provider?: string) => {
      const res = await fetch('/api/transformer/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuId, restaurantId, targetLangs, sourceLang, provider }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Translation failed')
      return json
    },
    [restaurantId]
  )

  const generateDescription = useCallback(
    async (dishName: string, opts?: {
      dishId?: string; ingredients?: string[]; category?: string;
      targetLang?: string; style?: string; save?: boolean
    }) => {
      const res = await fetch('/api/transformer/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishName, restaurantId, ...opts }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Description generation failed')
      return json as { description: string; provider: string; tokensUsed: number }
    },
    [restaurantId]
  )

  const generateImage = useCallback(
    async (dishName: string, opts?: {
      dishId?: string; description?: string; style?: string; save?: boolean
    }) => {
      const res = await fetch('/api/transformer/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishName, restaurantId, ...opts }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Image generation failed')
      return json as { imageUrl: string; provider: string; tokensUsed: number }
    },
    [restaurantId]
  )

  const runOcr = useCallback(
    async (imageUrl: string, opts?: {
      sourceLang?: string; format?: 'structured' | 'raw'
    }) => {
      const res = await fetch('/api/transformer/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, restaurantId, ...opts }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'OCR failed')
      return json as {
        extractedText: string
        structuredData?: {
          categories: Array<{ name: string; dishes: Array<{ name: string; description?: string; price?: number; category?: string }> }>
          rawDishes: Array<{ name: string; description?: string; price?: number; category?: string }>
        }
        confidence: number
        provider: string
        tokensUsed: number
      }
    },
    [restaurantId]
  )

  return {
    ...result,
    usage: result.data?.usage ?? null,
    transformerStatus: result.data?.status ?? null,
    recentActivity: result.data?.recentActivity ?? [],
    translateMenu,
    generateDescription,
    generateImage,
    runOcr,
  }
}

// ─── Subscription & Billing (Phase 04) hook ─────────────────────────────────

export interface ApiSubscriptionResponse {
  subscription: {
    id: string
    plan: string
    status: string
    isYearly: boolean
    trialEndsAt: string | null
    currentPeriodEnd: string | null
    graceEndsAt: string | null
    cancelAtPeriodEnd: boolean
    maxMenus: number
    maxDishes: number
    maxLanguages: number
    maxNfcTags: number
    stripeCustomerId: string | null
    hasStripe: boolean
    daysRemaining: number | null
  }
  usage: {
    menus: number
    dishes: number
    tables: number
  }
  transactions: Array<{
    id: string
    type: string
    status: string
    amount: number
    currency: string
    plan: string
    period: string
    description: string | null
    receiptUrl: string | null
    createdAt: string
  }>
}

export function useSubscription() {
  const result = useApi<ApiSubscriptionResponse>('/api/subscriptions')

  const checkout = useCallback(
    async (plan: string, isYearly: boolean = false) => {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, isYearly }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create checkout')
      return json as { checkoutUrl: string | null; sessionId?: string; demo?: boolean; message?: string }
    },
    []
  )

  const cancelSubscription = useCallback(async () => {
    const res = await fetch('/api/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to cancel')
    return json
  }, [])

  const resumeSubscription = useCallback(async () => {
    const res = await fetch('/api/subscriptions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resume' }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to resume')
    return json
  }, [])

  const openPortal = useCallback(async () => {
    const res = await fetch('/api/subscriptions/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to open portal')
    return json as { portalUrl: string }
  }, [])

  return {
    ...result,
    subscription: result.data?.subscription ?? null,
    usage: result.data?.usage ?? null,
    transactions: result.data?.transactions ?? [],
    checkout,
    cancelSubscription,
    resumeSubscription,
    openPortal,
  }
}

// ─── Barrel export ───────────────────────────────────────────────────────────

export { useApi, useMutation } from './useApi'
