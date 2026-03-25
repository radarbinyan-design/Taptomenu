import { NextRequest, NextResponse } from 'next/server'
import { getMenuData, getDemoMenuData, setMenuData } from '@/lib/menu-store'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  let menuData = getMenuData()
  if (!menuData) {
    menuData = getDemoMenuData()
    setMenuData(menuData)
  }

  const { searchParams } = request.nextUrl
  const lang = searchParams.get('lang') || 'en'
  const table = searchParams.get('table')

  return NextResponse.json({
    restaurant: {
      slug: params.slug,
      name: { ru: 'Мой Ресторан', en: 'My Restaurant', hy: '\u053b\u0574 \u054c\u0565\u057d\u057f\u0578\u0580\u0561\u0576\u0568' },
      primaryColor: menuData.colorPalette?.primary || '#8B4513',
      logoUrl: null,
    },
    menu: menuData,
    lang,
    table,
  })
}
