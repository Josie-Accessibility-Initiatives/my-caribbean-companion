import { type NextRequest, NextResponse } from 'next/server'
import { getWorldBankData } from '@/lib/external/worldbank'
import { getRestCountryData } from '@/lib/external/rest-countries'
import { getQualityOfLife } from '@/lib/external/quality-of-life'
import { getCostOfLiving } from '@/lib/cost-search'
import { COUNTRY_META } from '@/data/countryMeta'
import { ApiError, apiError, handleRouteError } from '@/lib/api'
import csmeRaw from '@/data/csme-complexity.json'
import type { CSMEComplexityMap } from '@/lib/types/csme'
import type { CountryComparisonData } from '@/lib/types/comparison'

const csme = csmeRaw as CSMEComplexityMap

// ── Per-country data assembly ─────────────────────────────────────

async function fetchCountryData(code: string): Promise<CountryComparisonData> {
  const meta = COUNTRY_META[code]

  const [worldbank, restcountry, qol, col] = await Promise.all([
    getWorldBankData(code),
    getRestCountryData(code),
    getQualityOfLife(code),
    getCostOfLiving(code, meta.name, meta.stats.searchCity),
  ])

  const csmeEntry = csme[code]

  return {
    code,
    name: meta.name,
    flag: restcountry.flag,
    flagAlt: restcountry.flagAlt,
    capital: meta.stats.capital,
    stats: {
      population: worldbank.population,
      populationYear: worldbank.populationYear,
      gdpPerCapita: worldbank.gdpPerCapita,
      gdpPerCapitaYear: worldbank.gdpPerCapitaYear,
      inflation: worldbank.inflation,
      currency: restcountry.currencyCode,
      currencySymbol: restcountry.currencySymbol,
      languages: restcountry.languages,
    },
    costOfLiving: {
      rentOneBedMin: col.rentOneBed.min,
      rentOneBedMax: col.rentOneBed.max,
      monthlyTotal: col.monthlyTotal,
      source: col.source,
    },
    qualityOfLife: {
      qualityOfLifeScore: qol.qualityOfLifeScore,
      safetyScore: qol.safetyScore,
      healthcareScore: qol.healthcareScore,
      costOfLivingIndex: qol.costOfLivingIndex,
      summary: qol.summary,
    },
    csme: csmeEntry
      ? {
          complexity: csmeEntry.complexity,
          processingWeeks: csmeEntry.processingWeeks,
          competentAuthority: csmeEntry.competentAuthority,
          inDemandProfessions: csmeEntry.inDemandProfessions,
          notes: csmeEntry.notes,
        }
      : null,
    industries: meta.industries,
  }
}

/** ?country=BB, ?countries=BB,JM or ?all=true → validated country codes. */
function resolveCodes(searchParams: URLSearchParams): string[] | null {
  const country = searchParams.get('country')
  if (country) {
    const code = country.trim().toUpperCase()
    if (!COUNTRY_META[code]) throw new ApiError(`Unknown country code: ${code}`, 400)
    return [code]
  }

  const countries = searchParams.get('countries')
  if (countries) {
    const codes = countries.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean)
    if (codes.length === 0) throw new ApiError('No valid country codes provided.', 400)
    const invalid = codes.filter((c) => !COUNTRY_META[c])
    if (invalid.length > 0) {
      throw new ApiError(`Unknown country code(s): ${invalid.join(', ')}`, 400)
    }
    return codes
  }

  if (searchParams.get('all') === 'true') return Object.keys(COUNTRY_META)
  return null
}

// ── Route handler ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const codes = resolveCodes(request.nextUrl.searchParams)
    if (!codes) {
      return apiError('Provide ?country=BB, ?countries=BB,JM, or ?all=true', 400)
    }
    const results = await Promise.all(codes.map(fetchCountryData))
    return NextResponse.json(Object.fromEntries(results.map((r) => [r.code, r])))
  } catch (err) {
    return handleRouteError(err, 'GET /api/compare', 'Failed to fetch comparison data.')
  }
}
