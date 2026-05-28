import { getCached, setCached } from '@/lib/cache'

const CACHE_KEY = 'exchange_rates:usd'
const CACHE_TTL_HOURS = 24

export const COUNTRY_CURRENCIES:
  Record<string, { code: string, symbol: string, name: string }> = {
  TT: { code: 'TTD', symbol: 'TT$', name: 'Trinidad Dollar' },
  BB: { code: 'BBD', symbol: 'Bds$', name: 'Barbados Dollar' },
  JM: { code: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
  GY: { code: 'GYD', symbol: 'G$', name: 'Guyanese Dollar' },
  LC: { code: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  GD: { code: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  DM: { code: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  VC: { code: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  KN: { code: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  AG: { code: 'XCD', symbol: 'EC$', name: 'East Caribbean Dollar' },
  SR: { code: 'SRD', symbol: 'Sr$', name: 'Surinamese Dollar' },
  BZ: { code: 'BZD', symbol: 'BZ$', name: 'Belize Dollar' }
}

export async function getExchangeRates():
  Promise<Record<string, number>> {

  const cached = await getCached<Record<string, number>>(
    CACHE_KEY
  )
  if (cached) return cached

  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/` +
    `${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`
  )

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates')
  }

  const data = await response.json()
  const allRates = data.conversion_rates as
    Record<string, number>

  const neededCurrencies =
    ['TTD', 'BBD', 'JMD', 'GYD', 'XCD', 'SRD', 'BZD']

  const rates = Object.fromEntries(
    Object.entries(allRates).filter(([code]) =>
      neededCurrencies.includes(code)
    )
  )

  await setCached(CACHE_KEY, rates, CACHE_TTL_HOURS)
  return rates
}

export async function convertUSDToLocal(
  amountUSD: number,
  countryCode: string
): Promise<{
  amount: number
  formatted: string
  currency: string
  symbol: string
} | null> {
  try {
    const currency = COUNTRY_CURRENCIES[countryCode]
    if (!currency) return null

    const rates = await getExchangeRates()
    const rate = rates[currency.code]
    if (!rate) return null

    const converted = amountUSD * rate

    return {
      amount: Math.round(converted),
      formatted: `${currency.symbol}${Math.round(
        converted
      ).toLocaleString()}`,
      currency: currency.code,
      symbol: currency.symbol
    }
  } catch {
    return null
  }
}
