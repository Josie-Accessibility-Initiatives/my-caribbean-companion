import { getCached, setCached } from '@/lib/cache'
import { ISO3_CODES } from '@/lib/constants'

const CACHE_TTL_HOURS = 24 * 30 // 30 days

export type RestCountryData = {
  flag: string
  flagAlt: string
  currencyCode: string
  currencyName: string
  currencySymbol: string
  languages: string[]
  region: string
  subregion: string
  timezones: string[]
  source: 'restcountries' | 'fallback'
}

export async function getRestCountryData(
  countryCode: string
): Promise<RestCountryData> {
  const cacheKey = `restcountry:${countryCode}`
  const cached = await getCached<RestCountryData>(
    cacheKey
  )
  if (cached) return cached

  const alpha3 = ISO3_CODES[countryCode]
  if (!alpha3) {
    return getFallbackData(countryCode)
  }

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/alpha/${alpha3}` +
      `?fields=flags,currencies,languages,` +
      `region,subregion,timezones`,
      { next: { revalidate: 60 * 60 * 24 * 30 } }
    )

    if (!response.ok) {
      return getFallbackData(countryCode)
    }

    const data = await response.json()
    const country = Array.isArray(data)
      ? data[0] : data

    const currencies = country.currencies ?? {}
    const currencyCode = Object.keys(currencies)[0]
      ?? 'USD'
    const currency = currencies[currencyCode] ?? {}

    const languages = Object.values(
      country.languages ?? {}
    ) as string[]

    const result: RestCountryData = {
      flag: country.flags?.svg ??
        country.flags?.png ?? '',
      flagAlt: country.flags?.alt ??
        `Flag of ${countryCode}`,
      currencyCode,
      currencyName: currency.name ?? currencyCode,
      currencySymbol: currency.symbol ?? currencyCode,
      languages,
      region: country.region ?? 'Caribbean',
      subregion: country.subregion ?? 'Caribbean',
      timezones: country.timezones ?? [],
      source: 'restcountries'
    }

    await setCached(cacheKey, result, CACHE_TTL_HOURS)
    return result

  } catch (error) {
    console.error('REST Countries API error:', error)
    return getFallbackData(countryCode)
  }
}

function getFallbackData(
  countryCode: string
): RestCountryData {
  const fallbacks: Record<string,
    Partial<RestCountryData>> = {
    TT: { currencyCode: 'TTD',
          currencySymbol: 'TT$', languages: ['English'] },
    BB: { currencyCode: 'BBD',
          currencySymbol: 'Bds$', languages: ['English'] },
    JM: { currencyCode: 'JMD',
          currencySymbol: 'J$', languages: ['English'] },
    GY: { currencyCode: 'GYD',
          currencySymbol: 'G$', languages: ['English'] },
    LC: { currencyCode: 'XCD',
          currencySymbol: 'EC$', languages: ['English'] },
    GD: { currencyCode: 'XCD',
          currencySymbol: 'EC$', languages: ['English'] },
    DM: { currencyCode: 'XCD',
          currencySymbol: 'EC$',
          languages: ['English', 'French'] },
    VC: { currencyCode: 'XCD',
          currencySymbol: 'EC$', languages: ['English'] },
    KN: { currencyCode: 'XCD',
          currencySymbol: 'EC$', languages: ['English'] },
    AG: { currencyCode: 'XCD',
          currencySymbol: 'EC$', languages: ['English'] },
    SR: { currencyCode: 'SRD',
          currencySymbol: 'Sr$',
          languages: ['Dutch', 'English'] },
    BZ: { currencyCode: 'BZD',
          currencySymbol: 'BZ$',
          languages: ['English', 'Spanish'] }
  }

  const fb = fallbacks[countryCode] ?? {}
  return {
    flag: '',
    flagAlt: `Flag of ${countryCode}`,
    currencyCode: fb.currencyCode ?? 'USD',
    currencyName: fb.currencyCode ?? 'Dollar',
    currencySymbol: fb.currencySymbol ?? '$',
    languages: fb.languages ?? ['English'],
    region: 'Americas',
    subregion: 'Caribbean',
    timezones: [],
    source: 'fallback'
  }
}
