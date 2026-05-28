import { searchWeb } from '@/lib/tavily'
import { extractJSON } from '@/lib/ai'
import { getCached, setCached } from '@/lib/cache'
import { COUNTRY_META } from '@/data/countryMeta'

const CACHE_TTL_HOURS = 24 * 7 // 7 days

const HOUSING_SEARCH_DOMAINS = [
  'booking.com',
  'airbnb.com',
  'caribbeanmls.com',
  'century21caribbean.com',
  'remax-caribbean.com'
]

export type HousingSearchResult = {
  averageRentOneBed: { min: number, max: number } | null
  averageRentTwoBed: { min: number, max: number } | null
  temporaryOptions: {
    name: string
    pricePerNight: number | null
    url: string
    type: 'hotel' | 'guesthouse' | 'apartment'
  }[]
  tips: string[]
  source: 'tavily' | 'fallback'
  searchedAt: string
}

export async function searchHousing(
  countryCode: string
): Promise<HousingSearchResult> {
  const cacheKey = `housing:${countryCode}`
  const cached = await getCached<HousingSearchResult>(cacheKey)
  if (cached) return cached

  const meta = COUNTRY_META[countryCode]
  if (!meta) return getFallbackHousing()

  const countryName = meta.name
  const searchCity = meta.stats.searchCity

  try {
    const [rentResults, tempResults] =
      await Promise.all([
        searchWeb(
          `apartment rental ${searchCity} ${countryName} monthly rent USD 2025`,
          {
            maxResults: 5,
            searchDepth: 'basic',
            includeDomains: HOUSING_SEARCH_DOMAINS
          }
        ),
        searchWeb(
          `short term accommodation guesthouse ${searchCity} ${countryName} per night`,
          {
            maxResults: 3,
            searchDepth: 'basic',
            includeDomains: HOUSING_SEARCH_DOMAINS
          }
        )
      ])

    const rentContext = rentResults
      .map(r => `Source: ${r.url}\n${r.content}`)
      .join('\n\n')

    const tempContext = tempResults
      .map(r => `Source: ${r.url}\n${r.content}`)
      .join('\n\n')

    const rentPrompt =
      `Extract rental price data for ${searchCity}, ${countryName} from these search results. All amounts USD.

       ${rentContext}

       Return JSON only:
       {
         "averageRentOneBed": {
           "min": number or null,
           "max": number or null
         },
         "averageRentTwoBed": {
           "min": number or null,
           "max": number or null
         },
         "tips": [
           "practical tip about renting here",
           "another tip"
         ]
       }

       Only extract data clearly stated in the results. Set null if not found.
       Tips should be practical advice for someone relocating under CSME.`

    const tempPrompt =
      `Extract temporary accommodation options for ${searchCity}, ${countryName} from these results.

       ${tempContext}

       Return JSON only:
       {
         "temporaryOptions": [
           {
             "name": "accommodation name",
             "pricePerNight": number or null,
             "url": "booking url",
             "type": "hotel" or "guesthouse" or "apartment"
           }
         ]
       }

       Include max 3 options.
       Only include clearly identified accommodations with real names.`

    const [rentRaw, tempRaw] = await Promise.all([
      extractJSON(rentPrompt),
      extractJSON(tempPrompt)
    ])

    const rentData = JSON.parse(rentRaw)
    const tempData = JSON.parse(tempRaw)

    const result: HousingSearchResult = {
      averageRentOneBed: rentData.averageRentOneBed ?? null,
      averageRentTwoBed: rentData.averageRentTwoBed ?? null,
      temporaryOptions: tempData.temporaryOptions ?? [],
      tips: rentData.tips ?? [],
      source: 'tavily',
      searchedAt: new Date().toISOString()
    }

    await setCached(cacheKey, result, CACHE_TTL_HOURS)
    return result

  } catch (error) {
    console.error('Housing search error:', error)
    const fallback = getFallbackHousing()
    await setCached(cacheKey, fallback, CACHE_TTL_HOURS)
    return fallback
  }
}

function getFallbackHousing(): HousingSearchResult {
  return {
    averageRentOneBed: null,
    averageRentTwoBed: null,
    temporaryOptions: [],
    tips: [],
    source: 'fallback',
    searchedAt: new Date().toISOString()
  }
}
