import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PublicMenuClient from './PublicMenuClient'

export const revalidate = 60 // ISR: revalidate every 60 seconds

// Demo slugs that use built-in demo data when DB is not configured
const DEMO_SLUGS = ['araratrest', 'demo']

interface MenuPageProps {
  params: { slug: string }
  searchParams: { lang?: string; currency?: string; table?: string }
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  if (DEMO_SLUGS.includes(params.slug)) {
    return {
      title: 'Ресторан «Арарат» — Меню',
      description: 'Лучшая армянская кухня в Ереване',
      robots: { index: false },
    }
  }
  const restaurant = await getRestaurant(params.slug)
  if (!restaurant) return { title: 'Меню не найдено' }

  return {
    title: `${restaurant.name} — Меню`,
    description: restaurant.description || `Цифровое меню ресторана ${restaurant.name}`,
    openGraph: {
      title: `${restaurant.name} — Меню`,
      images: restaurant.logoUrl ? [restaurant.logoUrl] : [],
    },
    robots: { index: false },
  }
}

async function getRestaurant(slug: string) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug, isActive: true },
      include: {
        menus: {
          where: { status: 'active', isDefault: true },
          include: {
            categories: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                menuDishes: {
                  where: { isAvailable: true },
                  orderBy: { sortOrder: 'asc' },
                  include: {
                    dish: true,
                  },
                },
              },
            },
          },
          take: 1,
        },
        tables: {
          where: { isActive: true },
          select: { id: true, name: true },
        },
      },
    })
    return restaurant
  } catch {
    // If DB not configured yet, return demo data
    return null
  }
}

// Demo data for development/preview
const DEMO_RESTAURANT = {
  id: 'demo',
  name: 'Ресторан «Арарат»',
  slug: 'araratrest',
  description: 'Лучшая армянская кухня в Ереване',
  logoUrl: null,
  coverUrl: null,
  primaryColor: '#F59E0B',
  accentColor: '#1F2937',
  templateId: 'classic',
  wifiName: 'Ararat_WiFi',
  menus: [
    {
      id: 'menu-1',
      name: 'Основное меню',
      languages: ['ru', 'en', 'hy', 'ar'],
      categories: [
        {
          id: 'cat-1',
          name: 'Закуски',
          nameTranslations: { en: 'Appetizers', hy: 'Ախորժակ', ar: 'مقبلات' },
          emoji: '🥗',
          menuDishes: [
            {
              id: 'md-1',
              isAvailable: true,
              specialPrice: null,
              dish: {
                id: 'd1',
                name: 'Греческий салат',
                nameTranslations: { en: 'Greek Salad', hy: 'Հունական աղցան', ar: 'سلطة يونانية' },
                description: 'Свежие овощи, сыр фета, маслины',
                descriptionTranslations: { en: 'Fresh vegetables, feta cheese, olives', hy: 'Թարմ բանջարեղեն, ֆետա պանիր, ձիթապտուղ' },
                price: 2500,
                imageUrl: null,
                calories: 280,
                weight: 250,
                isVegan: true,
                isGlutenFree: true,
                spicyLevel: 0,
                allergens: ['dairy'],
                tags: ['fresh', 'light'],
              },
            },
            {
              id: 'md-2',
              isAvailable: true,
              specialPrice: null,
              dish: {
                id: 'd2',
                name: 'Долма',
                nameTranslations: { en: 'Dolma', hy: 'Տոլմա', ar: 'دولمة' },
                description: 'Голубцы в виноградных листьях с мясом и рисом',
                descriptionTranslations: { en: 'Stuffed grape leaves with meat and rice', hy: 'Խաղողի տերևներ՝ լցոնված միսով և բրնձով' },
                price: 2800,
                imageUrl: null,
                calories: 320,
                weight: 300,
                isVegan: false,
                isGlutenFree: false,
                spicyLevel: 0,
                allergens: [],
                tags: ['armenian', 'traditional'],
              },
            },
          ],
        },
        {
          id: 'cat-2',
          name: 'Горячее',
          nameTranslations: { en: 'Main Course', hy: 'Տաք ուտեստ', ar: 'الطبق الرئيسي' },
          emoji: '🍖',
          menuDishes: [
            {
              id: 'md-3',
              isAvailable: true,
              specialPrice: null,
              dish: {
                id: 'd3',
                name: 'Хоровац из ягнёнка',
                nameTranslations: { en: 'Lamb Khorovats', hy: 'Գառան խորոված', ar: 'خروفاتس لحم الضأن' },
                description: 'Традиционный армянский шашлык на углях',
                descriptionTranslations: { en: 'Traditional Armenian charcoal-grilled lamb kebab', hy: 'Ավանդական հայկական բացօթյա խորոված' },
                price: 4800,
                imageUrl: null,
                calories: 520,
                weight: 350,
                isVegan: false,
                isGlutenFree: true,
                spicyLevel: 1,
                allergens: [],
                tags: ['signature', 'armenian'],
              },
            },
          ],
        },
        {
          id: 'cat-3',
          name: 'Напитки',
          nameTranslations: { en: 'Drinks', hy: 'Ըմպելիք', ar: 'مشروبات' },
          emoji: '🍷',
          menuDishes: [
            {
              id: 'md-4',
              isAvailable: true,
              specialPrice: null,
              dish: {
                id: 'd4',
                name: 'Армянское вино',
                nameTranslations: { en: 'Armenian Wine', hy: 'Հայկական գինի', ar: 'النبيذ الأرميني' },
                description: 'Красное сухое вино из армянских сортов винограда',
                descriptionTranslations: { en: 'Dry red wine from Armenian grape varieties', hy: 'Կարմիր չոր գինի հայկական խաղողի տեսակներից' },
                price: 1800,
                imageUrl: null,
                calories: 120,
                weight: 150,
                isVegan: true,
                isGlutenFree: true,
                spicyLevel: 0,
                allergens: ['sulphites'],
                tags: ['armenian'],
              },
            },
          ],
        },
      ],
    },
  ],
  tables: [
    { id: 't1', name: 'Столик 1' },
    { id: 't2', name: 'Столик 2' },
  ],
}

export default async function MenuPage({ params, searchParams }: MenuPageProps) {
  // Redirect demo slug to dedicated demo page
  if (params.slug === 'demo') {
    redirect('/menu/demo')
  }

  const restaurant = await getRestaurant(params.slug)
  
  // Use demo data for araratrest slug if DB not ready
  const data = restaurant || (params.slug === 'araratrest' ? DEMO_RESTAURANT : null)
  
  if (!data) notFound()

  return (
    <PublicMenuClient
      restaurant={data as any}
      initialLang={searchParams.lang || 'ru'}
      initialCurrency={searchParams.currency || 'AMD'}
      tableId={searchParams.table}
    />
  )
}
