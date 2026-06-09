import type { Complexity } from '@/lib/badge'

export type CountryComparisonData = {
  code: string
  name: string
  flag: string
  flagAlt: string
  capital: string
  stats: {
    population: number | null
    populationYear: number | null
    gdpPerCapita: number | null
    gdpPerCapitaYear: number | null
    inflation: number | null
    currency: string
    currencySymbol: string
    languages: string[]
  }
  costOfLiving: {
    rentOneBedMin: number | null
    rentOneBedMax: number | null
    monthlyTotal: number | null
    source: string
  }
  qualityOfLife: {
    qualityOfLifeScore: number | null
    safetyScore: number | null
    healthcareScore: number | null
    costOfLivingIndex: number | null
    summary: string | null
  }
  csme: {
    complexity: Complexity
    processingWeeks: { min: number; max: number }
    competentAuthority: string
    inDemandProfessions: string[]
    notes: string
  } | null
  industries: string[]
}
