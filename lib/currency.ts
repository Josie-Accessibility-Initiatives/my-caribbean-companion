export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$',    name: 'US Dollar',            flag: '🇺🇸' },
  { code: 'TTD', symbol: 'TT$',  name: 'Trinidad Dollar',      flag: '🇹🇹' },
  { code: 'BBD', symbol: 'Bds$', name: 'Barbados Dollar',      flag: '🇧🇧' },
  { code: 'JMD', symbol: 'J$',   name: 'Jamaican Dollar',      flag: '🇯🇲' },
  { code: 'GYD', symbol: 'G$',   name: 'Guyanese Dollar',      flag: '🇬🇾' },
  { code: 'XCD', symbol: 'EC$',  name: 'East Caribbean Dollar', flag: '🌴' },
  { code: 'SRD', symbol: 'Sr$',  name: 'Surinamese Dollar',    flag: '🇸🇷' },
  { code: 'BZD', symbol: 'BZ$',  name: 'Belize Dollar',        flag: '🇧🇿' },
] as const

export type SupportedCurrencyCode =
  (typeof SUPPORTED_CURRENCIES)[number]['code']

export type ConvertedAmount = {
  amount: number
  formatted: string
  symbol: string
  code: string
}

export function convertAmount(
  usdAmount: number,
  toCurrency: string,
  rates: Record<string, number>,
  symbol: string
): ConvertedAmount {
  if (toCurrency === 'USD') {
    return {
      amount: usdAmount,
      formatted: `$${usdAmount.toLocaleString()}`,
      symbol: '$',
      code: 'USD',
    }
  }

  const rate = rates[toCurrency]
  if (!rate) {
    // Rate not yet loaded — fall back to USD display
    return {
      amount: usdAmount,
      formatted: `$${usdAmount.toLocaleString()}`,
      symbol: '$',
      code: 'USD',
    }
  }

  const converted = Math.round(usdAmount * rate)
  return {
    amount: converted,
    formatted: `${symbol}${converted.toLocaleString()}`,
    symbol,
    code: toCurrency,
  }
}

export function formatCurrency(
  amount: number,
  symbol: string,
  code: string
): string {
  return `${symbol}${amount.toLocaleString()} ${code}`
}

export function getCurrencyMeta(code: string) {
  return (
    SUPPORTED_CURRENCIES.find((c) => c.code === code) ??
    SUPPORTED_CURRENCIES[0]
  )
}
