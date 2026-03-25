/**
 * TapMenu Armenia — Database Seed Script
 *
 * Creates demo data for development and testing.
 * Safe to run multiple times — uses upsert where possible.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed.ts
 *   # or via prisma:
 *   npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding TapMenu Armenia database...\n')

  // ─── 1. Demo Owner User ──────────────────────────────────────────────────
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      id: 'demo-owner-uuid-0001',
      email: 'owner@demo.com',
      name: 'Арам Петросян',
      phone: '+374 91 123456',
      role: 'owner',
      isEmailVerified: true,
      mustChangePassword: false,
    },
  })
  console.log(`  ✓ User: ${owner.name} (${owner.email})`)

  // ─── 2. Demo Admin User ──────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tapmenu.am' },
    update: {},
    create: {
      id: 'demo-admin-uuid-0001',
      email: 'admin@tapmenu.am',
      name: 'Admin TapMenu',
      role: 'superadmin',
      isEmailVerified: true,
      mustChangePassword: false,
    },
  })
  console.log(`  ✓ User: ${admin.name} (${admin.email})`)

  // ─── 3. Subscription for Owner ────────────────────────────────────────────
  const subscription = await prisma.subscription.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      plan: 'pro',
      status: 'active',
      maxMenus: 3,
      maxDishes: 100,
      maxLanguages: 5,
      maxNfcTags: 5,
      trialEndsAt: new Date('2026-04-24'),
      currentPeriodEnd: new Date('2027-03-24'),
    },
  })
  console.log(`  ✓ Subscription: ${subscription.plan} (${subscription.status})`)

  // ─── 4. Demo Restaurant ───────────────────────────────────────────────────
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'araratrest' },
    update: {},
    create: {
      id: 'demo-rest-uuid-0001',
      userId: owner.id,
      name: 'Ресторан «Арарат»',
      slug: 'araratrest',
      description: 'Лучшая армянская кухня в Ереване. Традиционные блюда и современные интерпретации.',
      address: 'ул. Абовяна 12, Ереван',
      city: 'Ереван',
      country: 'AM',
      phone: '+374 10 567890',
      website: 'https://ararat-restaurant.am',
      wifiName: 'Ararat_WiFi',
      primaryColor: '#F59E0B',
      accentColor: '#1F2937',
      templateId: 'classic',
    },
  })
  console.log(`  ✓ Restaurant: ${restaurant.name} (/${restaurant.slug})`)

  // ─── 5. Demo Menu ────────────────────────────────────────────────────────
  const menu = await prisma.menu.upsert({
    where: { id: 'demo-menu-uuid-0001' },
    update: {},
    create: {
      id: 'demo-menu-uuid-0001',
      restaurantId: restaurant.id,
      name: 'Основное меню',
      description: 'Полное меню ресторана «Арарат»',
      status: 'active',
      isDefault: true,
      languages: ['ru', 'en', 'hy', 'ar'],
    },
  })
  console.log(`  ✓ Menu: ${menu.name}`)

  // ─── 6. Categories ────────────────────────────────────────────────────────
  const categories = [
    { id: 'demo-cat-0001', name: 'Закуски', nameTranslations: { en: 'Appetizers', hy: 'Ախորժdelays', ar: 'مقبلات' }, emoji: '🥗', sortOrder: 0 },
    { id: 'demo-cat-0002', name: 'Горячее', nameTranslations: { en: 'Main Course', hy: 'Տաք ուտեստ', ar: 'الطبق الرئيسي' }, emoji: '🍖', sortOrder: 1 },
    { id: 'demo-cat-0003', name: 'Напитки', nameTranslations: { en: 'Drinks', hy: 'Ըمپելիք', ar: 'مشروبات' }, emoji: '🍷', sortOrder: 2 },
    { id: 'demo-cat-0004', name: 'Десерты', nameTranslations: { en: 'Desserts', hy: 'Աghանուադ', ar: 'حلويات' }, emoji: '🍰', sortOrder: 3 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { ...cat, menuId: menu.id },
    })
  }
  console.log(`  ✓ Categories: ${categories.length}`)

  // ─── 7. Dishes ────────────────────────────────────────────────────────────
  const dishes = [
    {
      id: 'demo-dish-0001',
      name: 'Греческий салат',
      nameTranslations: { en: 'Greek Salad', hy: 'Հունական աghtsan', ar: 'سلطة يونانية' },
      description: 'Свежие овощи, сыр фета, маслины, оливковое масло',
      descriptionTranslations: { en: 'Fresh vegetables, feta cheese, olives, olive oil', hy: 'Թարմ բանjareghen, feta panir, dzitaptugh' },
      price: 2500, calories: 280, weight: 250, isVegan: false, isGlutenFree: true, spicyLevel: 0,
      allergens: ['dairy'], tags: ['fresh', 'light'], categoryId: 'demo-cat-0001',
    },
    {
      id: 'demo-dish-0002',
      name: 'Долма',
      nameTranslations: { en: 'Dolma', hy: 'Տolma', ar: 'دولمة' },
      description: 'Голубцы в виноградных листьях с мясом и рисом',
      descriptionTranslations: { en: 'Stuffed grape leaves with meat and rice' },
      price: 2800, calories: 320, weight: 300, isVegan: false, isGlutenFree: false, spicyLevel: 0,
      allergens: [], tags: ['armenian', 'traditional'], categoryId: 'demo-cat-0001',
    },
    {
      id: 'demo-dish-0003',
      name: 'Хоровац из ягнёнка',
      nameTranslations: { en: 'Lamb Khorovats', hy: 'Գarran khorovats', ar: 'خروفاتس لحم الضأن' },
      description: 'Традиционный армянский шашлык на углях',
      descriptionTranslations: { en: 'Traditional Armenian charcoal-grilled lamb kebab' },
      price: 4800, calories: 520, weight: 350, isVegan: false, isGlutenFree: true, spicyLevel: 1,
      allergens: [], tags: ['signature', 'armenian'], categoryId: 'demo-cat-0002',
    },
    {
      id: 'demo-dish-0004',
      name: 'Армянское вино',
      nameTranslations: { en: 'Armenian Wine', hy: 'Haykakan gini', ar: 'النبيذ الأرميني' },
      description: 'Красное сухое вино из армянских сортов винограда',
      descriptionTranslations: { en: 'Dry red wine from Armenian grape varieties' },
      price: 1800, calories: 120, weight: 150, isVegan: true, isGlutenFree: true, spicyLevel: 0,
      allergens: ['sulphites'], tags: ['armenian'], categoryId: 'demo-cat-0003',
    },
    {
      id: 'demo-dish-0005',
      name: 'Люля-кебаб',
      nameTranslations: { en: 'Lula Kebab', hy: 'Lula-kebab' },
      description: 'Сочный кебаб из рубленой говядины с пряностями',
      descriptionTranslations: { en: 'Juicy minced beef kebab with spices' },
      price: 3200, calories: 410, weight: 280, isVegan: false, isGlutenFree: true, spicyLevel: 2,
      allergens: [], tags: ['spicy', 'grill'], categoryId: 'demo-cat-0002',
    },
    {
      id: 'demo-dish-0006',
      name: 'Гата',
      nameTranslations: { en: 'Gata', hy: 'Gata', ar: 'غاطة' },
      description: 'Традиционная армянская сладкая выпечка',
      descriptionTranslations: { en: 'Traditional Armenian sweet pastry' },
      price: 1200, calories: 350, weight: 180, isVegan: false, isGlutenFree: false, spicyLevel: 0,
      allergens: ['gluten', 'dairy'], tags: ['dessert', 'traditional'], categoryId: 'demo-cat-0004',
    },
    {
      id: 'demo-dish-0007',
      name: 'Тан (кисломолочный напиток)',
      nameTranslations: { en: 'Tan (Yogurt Drink)', hy: 'Tan' },
      description: 'Освежающий армянский кисломолочный напиток',
      descriptionTranslations: { en: 'Refreshing Armenian yogurt-based drink' },
      price: 600, calories: 45, weight: 300, isVegan: false, isGlutenFree: true, spicyLevel: 0,
      allergens: ['dairy'], tags: ['refreshing', 'armenian'], categoryId: 'demo-cat-0003',
    },
    {
      id: 'demo-dish-0008',
      name: 'Хашлама',
      nameTranslations: { en: 'Khashlama', hy: 'Khashlama' },
      description: 'Тушёная говядина с овощами по-армянски',
      descriptionTranslations: { en: 'Armenian-style braised beef with vegetables' },
      price: 4200, calories: 480, weight: 400, isVegan: false, isGlutenFree: true, spicyLevel: 0,
      allergens: [], tags: ['hearty', 'armenian'], categoryId: 'demo-cat-0002',
    },
  ]

  for (const { categoryId, ...dishData } of dishes) {
    const dish = await prisma.dish.upsert({
      where: { id: dishData.id },
      update: {},
      create: { ...dishData, restaurantId: restaurant.id },
    })

    // Link dish to menu + category
    await prisma.menuDish.upsert({
      where: { menuId_dishId: { menuId: menu.id, dishId: dish.id } },
      update: {},
      create: {
        menuId: menu.id,
        dishId: dish.id,
        categoryId,
        isAvailable: true,
        sortOrder: dishes.findIndex((d) => d.id === dish.id),
      },
    })
  }
  console.log(`  ✓ Dishes: ${dishes.length} (linked to menu & categories)`)

  // ─── 8. Tables ────────────────────────────────────────────────────────────
  const tables = [
    { id: 'demo-table-0001', name: 'Столик 1', nfcTagId: 'NFC-ARARAT-001' },
    { id: 'demo-table-0002', name: 'Столик 2', nfcTagId: 'NFC-ARARAT-002' },
    { id: 'demo-table-0003', name: 'VIP зал', nfcTagId: 'NFC-ARARAT-003' },
    { id: 'demo-table-0004', name: 'Терраса', nfcTagId: 'NFC-ARARAT-004' },
  ]

  for (const tbl of tables) {
    await prisma.table.upsert({
      where: { id: tbl.id },
      update: {},
      create: {
        ...tbl,
        restaurantId: restaurant.id,
        qrCode: `https://app.tapmenu.am/menu/araratrest?table=${encodeURIComponent(tbl.name)}`,
        isActive: true,
      },
    })
  }
  console.log(`  ✓ Tables: ${tables.length}`)

  // ─── 9. Exchange Rates ────────────────────────────────────────────────────
  const rates = [
    { from: 'AMD', to: 'USD', rate: 390 },
    { from: 'AMD', to: 'EUR', rate: 420 },
    { from: 'AMD', to: 'RUB', rate: 4.3 },
    { from: 'AMD', to: 'GBP', rate: 490 },
  ]

  for (const r of rates) {
    await prisma.exchangeRate.upsert({
      where: { fromCurrency_toCurrency: { fromCurrency: r.from, toCurrency: r.to } },
      update: { rate: r.rate },
      create: { fromCurrency: r.from, toCurrency: r.to, rate: r.rate },
    })
  }
  console.log(`  ✓ Exchange rates: ${rates.length}`)

  console.log('\n✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
