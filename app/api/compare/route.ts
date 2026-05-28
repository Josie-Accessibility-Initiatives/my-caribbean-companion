import { type NextRequest, NextResponse } from 'next/server'
import { getWorldBankData } from '@/lib/external/worldbank'
import { getRestCountryData } from '@/lib/external/rest-countries'
import { getQualityOfLife } from '@/lib/external/quality-of-life'
import { getCostOfLiving } from '@/lib/cost-search'
import { COUNTRY_META } from '@/data/countryMeta'
import { apiError } from '@/lib/api'
import csmeRaw from '@/data/csme-complexity.json'
import type { CSMEComplexityMap } from '@/lib/types/csme'

const csme = csmeRaw as CSMEComplexityMap

// ── Per-country data assembly ─────────────────────────────────────

async function fetchCountryData(code: string) {
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

function toRecord(
  results: Awaited<ReturnType<typeof fetchCountryData>>[]
): Record<string, (typeof results)[number]> {
  return Object.fromEntries(results.map((r) => [r.code, r]))
}

// ── Route handler ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const country = searchParams.get('country')
  const countries = searchParams.get('countries')
  const all = searchParams.get('all')

  // ── Mode 1: single country ──────────────────────────────────────
  if (country) {
    const code = country.trim().toUpperCase()
    if (!COUNTRY_META[code]) {
      return apiError(`Unknown country code: ${code}`, 400)
    }
    try {
      const data = await fetchCountryData(code)
      return NextResponse.json({ [code]: data })
    } catch (err) {
      console.error(`GET /api/compare?country=${code}:`, err)
      return apiError('Failed to fetch comparison data.', 500)
    }
  }

  // ── Mode 3: multiple countries ──────────────────────────────────
  if (countries) {
    const codes = countries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean)

    if (codes.length === 0) {
      return apiError('No valid country codes provided.', 400)
    }

    const invalid = codes.filter((c) => !COUNTRY_META[c])
    if (invalid.length > 0) {
      return apiError(
        `Unknown country code(s): ${invalid.join(', ')}`,
        400
      )
    }

    try {
      const results = await Promise.all(codes.map(fetchCountryData))
      return NextResponse.json(toRecord(results))
    } catch (err) {
      console.error('GET /api/compare?countries=...:', err)
      return apiError('Failed to fetch comparison data.', 500)
    }
  }

  // ── Mode 2: all countries ───────────────────────────────────────
  if (all === 'true') {
    const codes = Object.keys(COUNTRY_META)
    try {
      const results = await Promise.all(codes.map(fetchCountryData))
      return NextResponse.json(toRecord(results))
    } catch (err) {
      console.error('GET /api/compare?all=true:', err)
      return apiError('Failed to fetch comparison data.', 500)
    }
  }

  // ── No valid params ─────────────────────────────────────────────
  return apiError(
    'Provide ?country=BB, ?countries=BB,JM, or ?all=true',
    400
  )
}
