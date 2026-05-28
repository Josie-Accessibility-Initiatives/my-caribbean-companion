import { getCached, setCached } from '@/lib/cache'

const CACHE_TTL_HOURS = 24 * 30 // 30 days

const WB_COUNTRY_CODES: Record<string, string> = {
  TT: 'TTO', BB: 'BRB', JM: 'JAM', GY: 'GUY',
  LC: 'LCA', GD: 'GRD', DM: 'DMA', VC: 'VCT',
  KN: 'KNA', AG: 'ATG', SR: 'SUR', BZ: 'BLZ'
}

export type WorldBankData = {
  gdpPerCapita: number | null
  gdpPerCapitaYear: number | null
  inflation: number | null
  inflationYear: number | null
  population: number | null
  populationYear: number | null
  source: 'worldbank' | 'fallback'
}

async function fetchIndicator(
  wbCode: string,
  indicator: string
): Promise<{ value: number | null, date: number | null }> {
  const url =
    `https://api.worldbank.org/v2/country/` +
    `${wbCode}/indicator/${indicator}` +
    `?format=json&mrv=1&per_page=1`

  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 * 30 }
  })

  if (!response.ok) return { value: null, date: null }

  const data = await response.json()

  if (!data[1] || !data[1][0]) {
    return { value: null, date: null }
  }

  const entry = data[1][0]
  return {
    value: entry.value ?? null,
    date: entry.date ? parseInt(entry.date) : null
  }
}

export async function getWorldBankData(
  countryCode: string
): Promise<WorldBankData> {
  const cacheKey = `worldbank:${countryCode}`
  const cached = await getCached<WorldBankData>(cacheKey)
  if (cached) return cached

  const wbCode = WB_COUNTRY_CODES[countryCode]
  if (!wbCode) {
    return {
      gdpPerCapita: null, gdpPerCapitaYear: null,
      inflation: null, inflationYear: null,
      population: null, populationYear: null,
      source: 'fallback'
    }
  }

  try {
    const [gdp, inflation, population] =
      await Promise.all([
        fetchIndicator(wbCode, 'NY.GDP.PCAP.CD'),
        fetchIndicator(wbCode, 'FP.CPI.TOTL.ZG'),
        fetchIndicator(wbCode, 'SP.POP.TOTL')
      ])

    const result: WorldBankData = {
      gdpPerCapita: gdp.value
        ? Math.round(gdp.value) : null,
      gdpPerCapitaYear: gdp.date,
      inflation: inflation.value
        ? Math.round(inflation.value * 10) / 10 : null,
      inflationYear: inflation.date,
      population: population.value
        ? Math.round(population.value) : null,
      populationYear: population.date,
      source: 'worldbank'
    }

    await setCached(cacheKey, result, CACHE_TTL_HOURS)
    return result

  } catch (error) {
    console.error('World Bank API error:', error)
    return {
      gdpPerCapita: null, gdpPerCapitaYear: null,
      inflation: null, inflationYear: null,
      population: null, populationYear: null,
      source: 'fallback'
    }
  }
}

export async function getAllWorldBankData():
  Promise<Record<string, WorldBankData>> {
  const codes = Object.keys(WB_COUNTRY_CODES)
  const results = await Promise.all(
    codes.map(async code => ({
      code,
      data: await getWorldBankData(code)
    }))
  )
  return Object.fromEntries(
    results.map(r => [r.code, r.data])
  )
}
