import { searchWeb, QUALITY_OF_LIFE_DOMAINS } from '@/lib/tavily'
import { extractJSON } from '@/lib/ai'
import { getCached, setCached } from '@/lib/cache'
import { COUNTRY_META } from '@/data/countryMeta'

const CACHE_TTL_HOURS = 24 * 7 // 7 days

export type QualityOfLifeData = {
  qualityOfLifeScore: number | null
  safetyScore: number | null
  healthcareScore: number | null
  costOfLivingIndex: number | null
  climateScore: number | null
  internetScore: number | null
  summary: string | null
  source: 'tavily' | 'fallback'
  searchedAt: string
}

export async function getQualityOfLife(
  countryCode: string
): Promise<QualityOfLifeData> {
  const cacheKey = `qol:${countryCode}`
  const cached = await getCached<QualityOfLifeData>(
    cacheKey
  )
  if (cached) return cached

  const meta = COUNTRY_META[countryCode]
  if (!meta) return getFallbackQoL()

  const countryName = meta.name
  const searchCity = meta.stats.searchCity

  try {
    const query =
      `${searchCity} ${countryName} quality of life ` +
      `safety score healthcare index 2024 2025`

    const results = await searchWeb(query, {
      maxResults: 5,
      searchDepth: 'basic',
      includeDomains: QUALITY_OF_LIFE_DOMAINS
    })

    const context = results
      .map(r => `Source: ${r.url}\n${r.content}`)
      .join('\n\n')

    const prompt =
      `Extract quality of life data for ` +
      `${searchCity}, ${countryName} from ` +
      `these search results. ` +
      `All scores should be on a 0-100 scale.\n\n` +
      `${context}\n\n` +
      `Return JSON only, no markdown:\n` +
      `{\n` +
      `  "qualityOfLifeScore": number or null,\n` +
      `  "safetyScore": number or null,\n` +
      `  "healthcareScore": number or null,\n` +
      `  "costOfLivingIndex": number or null,\n` +
      `  "climateScore": number or null,\n` +
      `  "internetScore": number or null,\n` +
      `  "summary": "one sentence description"\n` +
      `}\n\n` +
      `If a score is not found set it to null.\n` +
      `Do not invent scores — only extract ` +
      `what is clearly stated in the results.\n` +
      `costOfLivingIndex: higher = more expensive\n` +
      `safetyScore: higher = safer\n` +
      `qualityOfLifeScore: higher = better quality`

    const raw = await extractJSON(prompt)
    const extracted = JSON.parse(raw)

    const data: QualityOfLifeData = {
      qualityOfLifeScore:
        extracted.qualityOfLifeScore ?? null,
      safetyScore:
        extracted.safetyScore ?? null,
      healthcareScore:
        extracted.healthcareScore ?? null,
      costOfLivingIndex:
        extracted.costOfLivingIndex ?? null,
      climateScore:
        extracted.climateScore ?? null,
      internetScore:
        extracted.internetScore ?? null,
      summary: extracted.summary ?? null,
      source: 'tavily',
      searchedAt: new Date().toISOString()
    }

    await setCached(cacheKey, data, CACHE_TTL_HOURS)
    return data

  } catch (error) {
    console.error('Quality of life search error:', error)
    const fallback = getFallbackQoL()
    await setCached(cacheKey, fallback, CACHE_TTL_HOURS)
    return fallback
  }
}

function getFallbackQoL(): QualityOfLifeData {
  return {
    qualityOfLifeScore: null,
    safetyScore: null,
    healthcareScore: null,
    costOfLivingIndex: null,
    climateScore: null,
    internetScore: null,
    summary: null,
    source: 'fallback',
    searchedAt: new Date().toISOString()
  }
}

export async function getAllQualityOfLife():
  Promise<Record<string, QualityOfLifeData>> {
  const codes = Object.keys(COUNTRY_META)
  const results = await Promise.all(
    codes.map(async code => ({
      code,
      data: await getQualityOfLife(code)
    }))
  )
  return Object.fromEntries(
    results.map(r => [r.code, r.data])
  )
}
