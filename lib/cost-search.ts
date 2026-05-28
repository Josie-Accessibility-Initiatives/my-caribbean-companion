import { searchWeb, COST_OF_LIVING_DOMAINS }
  from '@/lib/tavily'
import { extractJSON } from '@/lib/ai'
import { getCached, setCached } from '@/lib/cache'

// ── FLIGHT SEARCH ─────────────────────────────

export type FlightEstimate = {
  minPrice: number
  maxPrice: number
  currency: 'USD'
  typicalDuration: string | null
  airlines: string[]
  source: 'tavily' | 'fallback'
  searchedAt: string
}

export async function getFlightEstimate(
  fromCountry: string,
  fromCity: string,
  toCountry: string,
  toCity: string
): Promise<FlightEstimate> {
  const cacheKey = `flights:${fromCountry}:${toCountry}`
  const cached = await getCached<FlightEstimate>(cacheKey)
  if (cached) return cached

  try {
    const query =
      `cheapest flights from ${fromCity} to ${toCity}
       one way price USD 2025`

    const results = await searchWeb(query, {
      maxResults: 5,
      searchDepth: 'basic'
    })

    const context = results
      .map(r => r.content)
      .join('\n\n')

    const prompt =
      `Extract flight price information from
       this web search data about flights from
       ${fromCity} (${fromCountry}) to
       ${toCity} (${toCountry}).

       Search results:
       ${context}

       Return JSON only, no markdown:
       {
         "minPrice": number (lowest price in USD),
         "maxPrice": number (highest typical price USD),
         "typicalDuration": string or null
           (e.g. "2h 30m"),
         "airlines": string[] (airline names found)
       }

       If no clear prices found, estimate based on
       regional Caribbean flight costs:
       - Short routes under 500km: $100-250 USD
       - Medium routes 500-1500km: $200-400 USD
       - Long routes over 1500km: $300-600 USD`

    const raw = await extractJSON(prompt)
    const extracted = JSON.parse(
      raw.replace(/```json|```/g, '').trim()
    )

    const estimate: FlightEstimate = {
      minPrice: extracted.minPrice ?? 150,
      maxPrice: extracted.maxPrice ?? 400,
      currency: 'USD',
      typicalDuration: extracted.typicalDuration ?? null,
      airlines: extracted.airlines ?? [],
      source: 'tavily',
      searchedAt: new Date().toISOString()
    }

    await setCached(cacheKey, estimate, 24 * 7)
    return estimate

  } catch (error) {
    console.error('Flight search error:', error)
    return {
      minPrice: 150,
      maxPrice: 400,
      currency: 'USD',
      typicalDuration: null,
      airlines: [],
      source: 'fallback',
      searchedAt: new Date().toISOString()
    }
  }
}

// ── COST OF LIVING SEARCH ─────────────────────

export type CostOfLivingData = {
  rentOneBed: { min: number, max: number }
  monthlyGroceries: number
  monthlyTransport: number
  monthlyUtilities: number
  mealInexpensive: number
  monthlyTotal: number
  source: 'tavily' | 'fallback'
  searchedAt: string
}

export async function getCostOfLiving(
  countryCode: string,
  countryName: string,
  searchCity: string
): Promise<CostOfLivingData> {
  const cacheKey = `col:${countryCode}`
  const cached = await getCached<CostOfLivingData>(
    cacheKey
  )
  if (cached) return cached

  try {
    const query =
      `cost of living ${searchCity} ${countryName}
       rent groceries transport monthly expenses USD 2025`

    const results = await searchWeb(query, {
      maxResults: 5,
      searchDepth: 'basic',
      includeDomains: COST_OF_LIVING_DOMAINS
    })

    const context = results
      .map(r => `Source: ${r.url}\n${r.content}`)
      .join('\n\n')

    const prompt =
      `Extract cost of living data for
       ${searchCity}, ${countryName} from
       these search results. All amounts in USD.

       ${context}

       Return JSON only, no markdown:
       {
         "rentOneBed": {
           "min": number,
           "max": number
         },
         "monthlyGroceries": number,
         "monthlyTransport": number,
         "monthlyUtilities": number,
         "mealInexpensive": number,
         "monthlyTotal": number
       }

       If specific data is not found, use these
       Caribbean regional averages:
       - 1-bed rent: min $500, max $1200
       - Groceries: $250
       - Transport: $100
       - Utilities: $120
       - Meal: $10
       - Monthly total: $1200`

    const raw = await extractJSON(prompt)
    const extracted = JSON.parse(
      raw.replace(/```json|```/g, '').trim()
    )

    const data: CostOfLivingData = {
      rentOneBed: extracted.rentOneBed ??
        { min: 500, max: 1200 },
      monthlyGroceries: extracted.monthlyGroceries ?? 250,
      monthlyTransport: extracted.monthlyTransport ?? 100,
      monthlyUtilities: extracted.monthlyUtilities ?? 120,
      mealInexpensive: extracted.mealInexpensive ?? 10,
      monthlyTotal: extracted.monthlyTotal ?? 1200,
      source: 'tavily',
      searchedAt: new Date().toISOString()
    }

    await setCached(cacheKey, data, 24 * 7)
    return data

  } catch (error) {
    console.error('Cost of living search error:', error)
    return {
      rentOneBed: { min: 500, max: 1200 },
      monthlyGroceries: 250,
      monthlyTransport: 100,
      monthlyUtilities: 120,
      mealInexpensive: 10,
      monthlyTotal: 1200,
      source: 'fallback',
      searchedAt: new Date().toISOString()
    }
  }
}
