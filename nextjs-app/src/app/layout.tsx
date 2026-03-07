import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: {
    template: '%s | TapMenu Armenia',
    default: 'TapMenu Armenia — Цифровое меню для ресторанов',
  },
  description: 'SaaS платформа цифровых NFC-меню для ресторанов Армении. Одно касание — и гость видит меню. От $15/мес.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://app.tapmenu.am'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
