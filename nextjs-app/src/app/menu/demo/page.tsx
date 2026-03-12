import type { Metadata } from 'next'
import DemoMenuClient from './DemoMenuClient'

export const metadata: Metadata = {
  title: 'Ресторан Арарат — Меню | TapMenu',
  description: 'Демо-меню ресторана Арарат, Ереван, Армения. Армянская кухня: хоровац, долма, кюфта и другие блюда. Мультиязычное цифровое меню.',
  openGraph: {
    title: 'Ресторан Арарат — Меню | TapMenu',
    description: 'Лучшая армянская кухня в Ереване. Смотрите наше меню онлайн.',
    type: 'website',
    locale: 'ru_AM',
  },
  robots: { index: false },
}

export default function DemoMenuPage() {
  return <DemoMenuClient />
}
