import { NextRequest, NextResponse } from 'next/server'

// GET /api/exchange-rates
export async function GET() {
  try {
    // Fetch from Central Bank of Armenia API
    const today = new Date().toISOString().split('T')[0]
    const response = await fetch(
      `https://api.cba.am/exchangerates.asmx/ExchangeRatesByDate?DateExchangeRate=${today}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) throw new Error('CBA API error')

    const xml = await response.text()

    const extractRate = (xml: string, code: string): number | null => {
      const match = xml.match(
        new RegExp(`<ISO_4217>${code}<\\/ISO_4217>.*?<Rate>([\\d.]+)<\\/Rate>`, 's')
      )
      return match ? parseFloat(match[1]) : null
    }

    const rates = {
      AMD: 1,
      USD: extractRate(xml, 'USD') || 390,
      EUR: extractRate(xml, 'EUR') || 420,
      RUB: extractRate(xml, 'RUB') || 4.3,
      GBP: extractRate(xml, 'GBP') || 490,
    }

    return NextResponse.json({ rates, updatedAt: new Date().toISOString() })
  } catch (error) {
    // Fallback rates
    return NextResponse.json({
      rates: { AMD: 1, USD: 390, EUR: 420, RUB: 4.3, GBP: 490 },
      updatedAt: new Date().toISOString(),
      source: 'fallback',
    })
  }
}
