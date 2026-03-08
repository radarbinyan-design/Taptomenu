import type { Metadata } from 'next'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroSection } from '@/components/landing/HeroSection'
import { StatsSection } from '@/components/landing/StatsSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { CTASection } from '@/components/landing/CTASection'
import { ContactSection } from '@/components/landing/ContactSection'
import { LandingFooter } from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'TapMenu Armenia — NFC-меню для ресторанов. Одно касание — и гость видит меню',
  description:
    'SaaS платформа цифровых NFC-меню для ресторанов Армении. Гость подносит телефон — меню открывается мгновенно. 33 языка, аналитика, Wi-Fi через NFC. От $15/мес. 14 дней бесплатно.',
  keywords: [
    'NFC меню ресторан',
    'цифровое меню Армения',
    'QR меню ресторан',
    'TapMenu',
    'меню на телефоне',
    'ресторан Ереван меню',
    'digital menu Armenia',
  ],
  openGraph: {
    title: 'TapMenu Armenia — NFC-меню нового поколения',
    description: 'Одно касание телефона — гость видит меню на своём языке. 33 языка, аналитика, Wi-Fi через NFC. От $15/мес.',
    images: [{ url: 'https://tapmenu.am/images/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
    locale: 'ru_AM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TapMenu Armenia — NFC-меню для ресторанов',
    description: 'Одно касание — и гость видит меню на своём языке. 33 языка, аналитика, Wi-Fi через NFC.',
    images: ['https://tapmenu.am/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://tapmenu.am',
  },
}

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <FAQSection />
        <ContactSection />
        <CTASection />
      </main>
      <LandingFooter />
    </>
  )
}
