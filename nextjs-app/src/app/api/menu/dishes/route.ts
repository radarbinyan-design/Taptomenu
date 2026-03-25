import { NextRequest, NextResponse } from 'next/server'
import {
  getMenuData, setMenuData, getDemoMenuData,
  updateMenuDataDish, updateMenuCategory,
  addDishToCategory, removeDishFromCategory,
  addCategory, removeCategory,
  reorderCategories, reorderDishesInCategory,
} from '@/lib/menu-store'

// GET - get current menu data
export async function GET() {
  let data = getMenuData()
  if (!data) {
    data = getDemoMenuData()
    setMenuData(data)
  }
  return NextResponse.json({ data })
}

// PUT - update menu data (categories, dishes, reorder)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'update_dish': {
        const { categoryId, dishId, updates } = body
        updateMenuDataDish(categoryId, dishId, updates)
        return NextResponse.json({ success: true })
      }
      case 'update_category': {
        const { categoryId, updates } = body
        updateMenuCategory(categoryId, updates)
        return NextResponse.json({ success: true })
      }
      case 'add_dish': {
        const { categoryId, dish } = body
        addDishToCategory(categoryId, dish)
        return NextResponse.json({ success: true })
      }
      case 'remove_dish': {
        const { categoryId, dishId } = body
        removeDishFromCategory(categoryId, dishId)
        return NextResponse.json({ success: true })
      }
      case 'add_category': {
        const { category } = body
        addCategory(category)
        return NextResponse.json({ success: true })
      }
      case 'remove_category': {
        const { categoryId } = body
        removeCategory(categoryId)
        return NextResponse.json({ success: true })
      }
      case 'reorder_categories': {
        const { orderedIds } = body
        reorderCategories(orderedIds)
        return NextResponse.json({ success: true })
      }
      case 'reorder_dishes': {
        const { categoryId, orderedIds } = body
        reorderDishesInCategory(categoryId, orderedIds)
        return NextResponse.json({ success: true })
      }
      case 'set_full_menu': {
        const { data } = body
        setMenuData(data)
        return NextResponse.json({ success: true })
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[menu/dishes] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
