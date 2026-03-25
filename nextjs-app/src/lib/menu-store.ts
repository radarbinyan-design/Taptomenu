// In-memory store for AI menu generation jobs (MVP - replace with DB later)
import type { GenerationJob, GeneratedMenuData, GeneratedCategory, GeneratedDish, ColorPalette } from '@/types'

const jobs = new Map<string, GenerationJob>()

// Shared menu data store (in-memory for MVP)
let menuData: GeneratedMenuData | null = null

export function createJob(id: string, restaurantId: string, photos: string[], logo: string): GenerationJob {
  const job: GenerationJob = {
    id,
    restaurantId,
    status: 'pending',
    progress: 0,
    currentStep: 'Инициализация...',
    photos,
    logo,
    createdAt: new Date(),
  }
  jobs.set(id, job)
  return job
}

export function getJob(id: string): GenerationJob | undefined {
  return jobs.get(id)
}

export function updateJob(id: string, updates: Partial<GenerationJob>): GenerationJob | undefined {
  const job = jobs.get(id)
  if (!job) return undefined
  const updated = { ...job, ...updates }
  jobs.set(id, updated)
  return updated
}

export function setMenuData(data: GeneratedMenuData) {
  menuData = data
}

export function getMenuData(): GeneratedMenuData | null {
  return menuData
}

export function updateMenuDataDish(categoryId: string, dishId: string, updates: Partial<GeneratedDish>) {
  if (!menuData) return
  for (const cat of menuData.categories) {
    if (cat.id === categoryId) {
      const idx = cat.dishes.findIndex(d => d.id === dishId)
      if (idx !== -1) {
        cat.dishes[idx] = { ...cat.dishes[idx], ...updates }
      }
    }
  }
}

export function updateMenuCategory(categoryId: string, updates: Partial<GeneratedCategory>) {
  if (!menuData) return
  const idx = menuData.categories.findIndex(c => c.id === categoryId)
  if (idx !== -1) {
    menuData.categories[idx] = { ...menuData.categories[idx], ...updates }
  }
}

export function addDishToCategory(categoryId: string, dish: GeneratedDish) {
  if (!menuData) return
  const cat = menuData.categories.find(c => c.id === categoryId)
  if (cat) {
    cat.dishes.push(dish)
  }
}

export function removeDishFromCategory(categoryId: string, dishId: string) {
  if (!menuData) return
  const cat = menuData.categories.find(c => c.id === categoryId)
  if (cat) {
    cat.dishes = cat.dishes.filter(d => d.id !== dishId)
  }
}

export function addCategory(category: GeneratedCategory) {
  if (!menuData) return
  menuData.categories.push(category)
}

export function removeCategory(categoryId: string) {
  if (!menuData) return
  menuData.categories = menuData.categories.filter(c => c.id !== categoryId)
}

export function reorderCategories(orderedIds: string[]) {
  if (!menuData) return
  const catMap = new Map(menuData.categories.map(c => [c.id, c]))
  menuData.categories = orderedIds.map(id => catMap.get(id)!).filter(Boolean)
}

export function reorderDishesInCategory(categoryId: string, orderedIds: string[]) {
  if (!menuData) return
  const cat = menuData.categories.find(c => c.id === categoryId)
  if (cat) {
    const dishMap = new Map(cat.dishes.map(d => [d.id, d]))
    cat.dishes = orderedIds.map(id => dishMap.get(id)!).filter(Boolean)
  }
}

// Demo data for testing without OpenAI
export function getDemoMenuData(): GeneratedMenuData {
  return {
    categories: [
      {
        id: 'cat-appetizers',
        name: { ru: 'Закуски', en: 'Appetizers', hy: '\u0546\u0561\u056d\u0578\u0582\u057f\u0565\u057d\u057f\u0576\u0565\u0580' },
        emoji: '\uD83E\uDD57',
        dishes: [
          {
            id: 'dish-1',
            name: { ru: 'Хумус с лавашем', en: 'Hummus with Lavash', hy: '\u0540\u0578\u0582\u0574\u0578\u0582\u057d \u056c\u0561\u057e\u0561\u0577\u0578\u057e' },
            description: {
              ru: 'Нежный хумус из нута с оливковым маслом и свежим лавашем',
              en: 'Smooth chickpea hummus with olive oil and fresh lavash bread',
              hy: '\u0546\u0580\u0562\u0565\u0580 \u057d\u056b\u057d\u0565\u057c\u056b \u0570\u0578\u0582\u0574\u0578\u0582\u057d\u0589 \u0571\u056b\u0569\u0561\u057a\u0572\u0561\u057f\u056b \u0575\u0578\u0582\u0572\u0578\u057e \u0587 \u0569\u0561\u0580\u0574 \u056c\u0561\u057e\u0561\u0577\u0578\u057e'
            },
            price: 1500,
            generatedByAI: true,
          },
          {
            id: 'dish-2',
            name: { ru: 'Долма', en: 'Dolma', hy: '\u054f\u0578\u056c\u0574\u0561' },
            description: {
              ru: 'Голубцы в виноградных листьях с мясом ягненка и рисом',
              en: 'Grape leaves stuffed with lamb and rice',
              hy: '\u053d\u0561\u0572\u0578\u0572\u056b \u057f\u0565\u0580\u0587\u0576\u0565\u0580\u0578\u057e \u056c\u0581\u0578\u0576\u057e\u0561\u056e \u0563\u0561\u057c\u0576\u056b \u0574\u056b\u057d\u0578\u057e \u0587 \u0562\u0580\u0576\u0571\u0578\u057e'
            },
            price: 2800,
            generatedByAI: true,
          },
          {
            id: 'dish-3',
            name: { ru: 'Греческий салат', en: 'Greek Salad', hy: '\u0540\u0578\u0582\u0576\u0561\u056f\u0561\u0576 \u0561\u0572\u0581\u0561\u0576' },
            description: {
              ru: 'Свежие овощи, сыр фета, маслины, оливковое масло',
              en: 'Fresh vegetables, feta cheese, olives, olive oil',
              hy: '\u0539\u0561\u0580\u0574 \u0562\u0561\u0576\u057b\u0561\u0580\u0565\u0572\u0565\u0576\u056b \u057f\u0565\u057d\u0561\u056f\u0561\u0576\u056b\u0584\u0589 \u0586\u0565\u057f\u0561 \u057a\u0561\u0576\u056b\u0580\u0589 \u0571\u056b\u0569\u0561\u057a\u057f\u0578\u0582\u0572\u0576\u0565\u0580\u0589 \u0571\u056b\u0569\u0561\u057a\u0572\u0561\u057f\u056b \u0575\u0578\u0582\u0572'
            },
            price: 2500,
            generatedByAI: true,
          },
        ],
      },
      {
        id: 'cat-mains',
        name: { ru: 'Горячие блюда', en: 'Main Courses', hy: '\u0540\u056b\u0574\u0576\u0561\u056f\u0561\u0576 \u0578\u0582\u057f\u0565\u057d\u057f\u0576\u0565\u0580' },
        emoji: '\uD83C\uDF56',
        dishes: [
          {
            id: 'dish-4',
            name: { ru: 'Хоровац из ягненка', en: 'Lamb Khorovats', hy: '\u0533\u0561\u057c\u0576\u056b \u056d\u0578\u0580\u0578\u057e\u0561\u056e' },
            description: {
              ru: 'Традиционный армянский шашлык на углях из мраморного ягненка',
              en: 'Traditional Armenian charcoal-grilled marble lamb kebab',
              hy: '\u0531\u057e\u0561\u0576\u0564\u0561\u056f\u0561\u0576 \u0570\u0561\u0575\u056f\u0561\u056f\u0561\u0576 \u056d\u0578\u0580\u0578\u057e\u0561\u056e \u0574\u0561\u0580\u0574\u0561\u0580\u0561\u0575\u056b\u0576 \u0563\u0561\u057c\u0576\u056b \u0574\u056b\u057d\u056b\u0581'
            },
            price: 4800,
            generatedByAI: true,
          },
          {
            id: 'dish-5',
            name: { ru: 'Стейк рибай', en: 'Ribeye Steak', hy: '\u054c\u056b\u0562\u0561\u0575 \u057d\u0569\u0565\u0575\u0584' },
            description: {
              ru: 'Мраморная говядина, средняя прожарка, с соусом из красного вина',
              en: 'Marble beef, medium rare, with red wine sauce',
              hy: '\u0544\u0561\u0580\u0574\u0561\u0580\u0561\u0575\u056b\u0576 \u057f\u0561\u057e\u0561\u0580\u056b \u0574\u056b\u057d\u0589 \u0574\u056b\u057b\u056b\u0576 \u0565\u0583\u057e\u0561\u056e\u0584\u0578\u057e\u0589 \u056f\u0561\u0580\u0574\u056b\u0580 \u0563\u056b\u0576\u0578\u0582 \u057d\u0578\u0582\u057d\u0578\u057e'
            },
            price: 7500,
            generatedByAI: true,
          },
          {
            id: 'dish-6',
            name: { ru: 'Лосось на гриле', en: 'Grilled Salmon', hy: '\u054d\u0561\u0563\u0574\u0578\u0576 \u0563\u0580\u056b\u056c\u056b \u057e\u0580\u0561' },
            description: {
              ru: 'Филе лосося на гриле с лимонным соусом и овощами',
              en: 'Grilled salmon fillet with lemon sauce and vegetables',
              hy: '\u054d\u0561\u0563\u0574\u0578\u0576\u056b \u0586\u056b\u056c\u0565 \u0563\u0580\u056b\u056c\u056b \u057e\u0580\u0561\u0589 \u056f\u056b\u057f\u0580\u0578\u0576\u056b \u057d\u0578\u0582\u057d\u0578\u057e \u0587 \u0562\u0561\u0576\u057b\u0561\u0580\u0565\u0572\u0565\u0576\u0578\u057e'
            },
            price: 5500,
            generatedByAI: true,
          },
        ],
      },
      {
        id: 'cat-drinks',
        name: { ru: 'Напитки', en: 'Drinks', hy: '\u0538\u0574\u057a\u0565\u056c\u056b\u0584\u0576\u0565\u0580' },
        emoji: '\uD83C\uDF77',
        dishes: [
          {
            id: 'dish-7',
            name: { ru: 'Армянское вино', en: 'Armenian Wine', hy: '\u0540\u0561\u0575\u056f\u0561\u056f\u0561\u0576 \u0563\u056b\u0576\u056b' },
            description: {
              ru: 'Красное сухое вино из армянского сорта Арени',
              en: 'Dry red wine from Armenian Areni grape variety',
              hy: '\u053f\u0561\u0580\u0574\u056b\u0580 \u0579\u0578\u0580 \u0563\u056b\u0576\u056b \u0570\u0561\u0575\u056f\u0561\u056f\u0561\u0576 \u0531\u0580\u0565\u0576\u056b \u057d\u0578\u0580\u057f\u056b\u0581'
            },
            price: 1800,
            generatedByAI: true,
          },
          {
            id: 'dish-8',
            name: { ru: 'Домашний лимонад', en: 'Homemade Lemonade', hy: '\u054f\u0576\u0561\u056f\u0561\u0576 \u056c\u056b\u0574\u0578\u0576\u0561\u0564' },
            description: {
              ru: 'Освежающий лимонад с мятой и свежими ягодами',
              en: 'Refreshing lemonade with mint and fresh berries',
              hy: '\u0539\u0561\u0580\u0574\u0561\u0581\u0576\u0578\u0572 \u056c\u056b\u0574\u0578\u0576\u0561\u0564\u0589 \u0561\u0576\u0561\u0576\u0578\u0582\u056d\u0578\u057e \u0587 \u0569\u0561\u0580\u0574 \u0570\u0561\u057f\u0561\u057a\u057f\u0578\u0582\u0572\u0576\u0565\u0580\u0578\u057e'
            },
            price: 900,
            generatedByAI: true,
          },
        ],
      },
      {
        id: 'cat-desserts',
        name: { ru: 'Десерты', en: 'Desserts', hy: '\u0531\u0572\u0561\u0576\u0564\u0565\u0580\u0576\u0565\u0580' },
        emoji: '\uD83C\uDF70',
        dishes: [
          {
            id: 'dish-9',
            name: { ru: 'Пахлава', en: 'Baklava', hy: '\u0553\u0561\u056d\u056c\u0561\u057e\u0561' },
            description: {
              ru: 'Классическая пахлава с грецкими орехами и медом',
              en: 'Classic baklava with walnuts and honey',
              hy: '\u0534\u0561\u057d\u0561\u056f\u0561\u0576 \u0583\u0561\u056d\u056c\u0561\u057e\u0561\u0589 \u0568\u0576\u056f\u0578\u0582\u0575\u0566\u0578\u057e \u0587 \u0574\u0565\u0572\u0580\u0578\u057e'
            },
            price: 1200,
            generatedByAI: true,
          },
          {
            id: 'dish-10',
            name: { ru: 'Тирамису', en: 'Tiramisu', hy: '\u054f\u056b\u0580\u0561\u0574\u056b\u057d\u0578\u0582' },
            description: {
              ru: 'Итальянский десерт с маскарпоне и кофе',
              en: 'Italian dessert with mascarpone and coffee',
              hy: '\u053b\u057f\u0561\u056c\u0561\u056f\u0561\u0576 \u0561\u0572\u0561\u0576\u0564\u0565\u0580\u0589 \u0574\u0561\u057d\u056f\u0561\u0580\u057a\u0578\u0576\u0565\u0578\u057e \u0587 \u057d\u0578\u0582\u0580\u0573\u0578\u057e'
            },
            price: 1500,
            generatedByAI: true,
          },
        ],
      },
    ],
    colorPalette: {
      primary: '#8B4513',
      secondary: '#F5F5DC',
      accent: '#DAA520',
      dark: '#2C1810',
      light: '#FFF8DC',
    },
    designTemplates: [
      { id: 'tmpl-1', name: 'Elegant Gold', style: 'elegant', preview: '\uD83D\uDC51', colors: ['#DAA520', '#2C1810', '#FFF8DC'] },
      { id: 'tmpl-2', name: 'Modern Clean', style: 'modern', preview: '\u2728', colors: ['#333', '#fff', '#f0f0f0'] },
      { id: 'tmpl-3', name: 'Casual Warm', style: 'casual', preview: '\u2600\uFE0F', colors: ['#E85D04', '#FFF3E0', '#BF360C'] },
      { id: 'tmpl-4', name: 'Minimal Mono', style: 'minimalist', preview: '\u2B1C', colors: ['#000', '#fff', '#888'] },
      { id: 'tmpl-5', name: 'Armenian Heritage', style: 'elegant', preview: '\uD83C\uDDE6\uD83C\uDDF2', colors: ['#D50032', '#FF9B2B', '#002B5C'] },
    ],
  }
}
