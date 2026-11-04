import type { CountryComparisonData } from '@/lib/types/comparison'
import { COMPLEXITY_ORDER } from '@/lib/badge'
import { capitalize } from '@/lib/format'
import { professionMatches } from '@/lib/country-utils'

function SummaryCard({
  emoji,
  label,
  country,
  detail,
}: {
  emoji: string
  label: string
  country: CountryComparisonData
  detail: string
}) {
  return (
    <div className="ct-card">
      <span className="ct-card-emoji">{emoji}</span>
      <div>
        <div className="ct-card-label">{label}</div>
        <div className="ct-card-country">{country.name}</div>
        <div className="ct-card-detail">{detail}</div>
      </div>
    </div>
  )
}

const byComplexity = (a: CountryComparisonData, b: CountryComparisonData) =>
  COMPLEXITY_ORDER[a.csme!.complexity] - COMPLEXITY_ORDER[b.csme!.complexity]

/** "Easiest CSME", "Most affordable" and "Best for <profession>" highlight cards. */
export default function ComparisonSummary({
  countries,
  userCategory,
  formatMoney,
}: {
  countries: CountryComparisonData[]
  userCategory?: string
  formatMoney: (usd: number) => string
}) {
  const withCsme = countries.filter((c) => c.csme)

  const easiest = [...withCsme].sort(
    (a, b) => byComplexity(a, b) || a.csme!.processingWeeks.min - b.csme!.processingWeeks.min
  )[0]

  const mostAffordable = countries
    .filter((c) => c.costOfLiving.monthlyTotal !== null)
    .sort((a, b) => a.costOfLiving.monthlyTotal! - b.costOfLiving.monthlyTotal!)[0]

  const bestMatch = userCategory
    ? withCsme
        .filter((c) =>
          c.csme!.inDemandProfessions.some((p) => professionMatches(p, userCategory))
        )
        .sort(byComplexity)[0]
    : undefined

  return (
    <div className="ct-cards">
      {easiest && (
        <SummaryCard
          emoji="✅"
          label="Easiest CSME"
          country={easiest}
          detail={`${easiest.csme!.processingWeeks.min}–${easiest.csme!.processingWeeks.max} wks`}
        />
      )}
      {mostAffordable && (
        <SummaryCard
          emoji="💰"
          label="Most affordable"
          country={mostAffordable}
          detail={`${formatMoney(Math.round(mostAffordable.costOfLiving.monthlyTotal!))}/mo`}
        />
      )}
      {bestMatch && (
        <SummaryCard
          emoji="⭐"
          label={`Best for ${userCategory}`}
          country={bestMatch}
          detail={`${capitalize(bestMatch.csme!.complexity)} CSME process`}
        />
      )}
    </div>
  )
}
