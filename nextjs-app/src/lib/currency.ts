// Currency utilities using Central Bank of Armenia exchange rates

export interface ExchangeRateData {
  AMD: number
  USD: number
  EUR: number
  RUB: number
  GBP: number
  [key: string]: number
}

let cachedRates: ExchangeRateData | null = null
let cacheTime: number = 0
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export async function getExchangeRates(): Promise<ExchangeRateData> {
  if (cachedRates && Date.now() - cacheTime < CACHE_TTL) {
    return cachedRates
  }

  try {
    // Central Bank of Armenia API
    const response = await fetch(
      'https://api.cba.am/exchangerates.asmx/ExchangeRatesByDate?DateExchangeRate=' +
      new Date().toISOString().split('T')[0]
    )
    
    if (!response.ok) throw new Error('CBA API error')
    
    const xml = await response.text()
    // Parse XML response (simplified) - use [\s\S] instead of dotAll flag /s
    const rates: ExchangeRateData = { AMD: 1, USD: 0, EUR: 0, RUB: 0, GBP: 0 }
    
    const extractRate = (code: string): number | null => {
      const m = xml.match(new RegExp(`<ISO_4217>${code}<\\/ISO_4217>[\\s\\S]*?<Rate>([\\d.]+)<\\/Rate>`))
      return m ? parseFloat(m[1]) : null
    }
    
    rates.USD = extractRate('USD') || 0
    rates.EUR = extractRate('EUR') || 0
    rates.RUB = extractRate('RUB') || 0
    rates.GBP = extractRate('GBP') || 0
    
    cachedRates = rates
    cacheTime = Date.now()
    return rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    // Fallback rates (approx)
    return { AMD: 1, USD: 390, EUR: 420, RUB: 4.3, GBP: 490 }
  }
}

export function convertPrice(
  amountAMD: number,
  targetCurrency: string,
  rates: ExchangeRateData
): number {
  if (targetCurrency === 'AMD') return amountAMD
  const rate = rates[targetCurrency]
  if (!rate) return amountAMD
  return Math.round((amountAMD / rate) * 100) / 100
}

export function formatPrice(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    AMD: '֏',
    USD: '$',
    EUR: '€',
    RUB: '₽',
    GBP: '£',
  }
  const symbol = symbols[currency] || currency
  
  if (currency === 'AMD') {
    return `${amount.toLocaleString('ru-AM')} ${symbol}`
  }
  
  return `${symbol}${amount.toFixed(2)}`
}
