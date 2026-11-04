'use client'

import { useMemo } from 'react'
import type { CountryComparisonData } from '@/lib/types/comparison'
import { COUNTRY_ORDER } from '@/lib/constants'
import { professionMatches } from '@/lib/country-utils'

// ── Types ─────────────────────────────────────────────────────────

interface ProfessionHeatmapProps {
  data: Record<string, CountryComparisonData>
  highlightProfession?: string
}

// ── Component ─────────────────────────────────────────────────────

export default function ProfessionHeatmap({
  data,
  highlightProfession,
}: ProfessionHeatmapProps) {
  const countries = useMemo(
    () =>
      COUNTRY_ORDER.filter((code) => data[code]).map((code) => data[code]),
    [data]
  )

  // Build profession set, sorted: highlight first → count desc → alpha
  const { professions, matrix } = useMemo(() => {
    const profMap = new Map<string, Set<string>>()

    for (const country of countries) {
      for (const p of country.csme?.inDemandProfessions ?? []) {
        if (!profMap.has(p)) profMap.set(p, new Set())
        profMap.get(p)!.add(country.code)
      }
    }

    const sorted = [...profMap.keys()].sort((a, b) => {
      if (highlightProfession) {
        const aMatch = professionMatches(a, highlightProfession)
        const bMatch = professionMatches(b, highlightProfession)
        if (aMatch && !bMatch) return -1
        if (!aMatch && bMatch) return 1
      }
      const countDiff =
        (profMap.get(b)?.size ?? 0) - (profMap.get(a)?.size ?? 0)
      if (countDiff !== 0) return countDiff
      return a.localeCompare(b)
    })

    const matrix: Record<string, Record<string, boolean>> = {}
    for (const [prof, codes] of profMap) {
      matrix[prof] = {}
      for (const country of countries) {
        matrix[prof][country.code] = codes.has(country.code)
      }
    }

    return { professions: sorted, matrix }
  }, [countries, highlightProfession])

  // Summary stats — computed over all countries, not a filtered view
  const professionCounts = useMemo(
    () =>
      professions.map((p) => ({
        name: p,
        count: countries.filter((c) => matrix[p]?.[c.code]).length,
      })),
    [professions, countries, matrix]
  )

  const countryCounts = useMemo(
    () =>
      countries.map((c) => ({
        name: c.name,
        code: c.code,
        count: professions.filter((p) => matrix[p]?.[c.code]).length,
      })),
    [countries, professions, matrix]
  )

  const topProfession = [...professionCounts].sort(
    (a, b) => b.count - a.count
  )[0]

  const topCountry = [...countryCounts].sort(
    (a, b) => b.count - a.count
  )[0]

  if (countries.length === 0) {
    return (
      <p className="ph-empty">No data available yet.</p>
    )
  }

  return (
    <div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className="ph-table-wrap">
        <table className="ph-table">
          <thead>
            <tr>
              <th className="ph-th ph-sticky-col ph-prof-col">
                Profession
              </th>
              {countries.map((c) => (
                <th key={c.code} className="ph-th ph-country-col">
                  <div className="ph-country-header">
                    <span className="ph-code">{c.code}</span>
                    {c.flag ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.flag}
                        alt={c.flagAlt}
                        className="ph-flag"
                        loading="lazy"
                      />
                    ) : (
                      <span className="ph-flag-placeholder" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {professions.map((prof) => {
              const isHighlighted =
                !!highlightProfession &&
                professionMatches(prof, highlightProfession)

              return (
                <tr
                  key={prof}
                  className={`ph-row${isHighlighted ? ' ph-row-highlight' : ''}`}
                >
                  <td className="ph-td ph-sticky-col ph-prof-cell">
                    <div className="ph-prof-inner">
                      <span
                        className={`ph-prof-name${
                          isHighlighted ? ' ph-prof-hl' : ''
                        }`}
                      >
                        {prof}
                      </span>
                      {isHighlighted && (
                        <span className="ph-your-label">
                          ← Your profession
                        </span>
                      )}
                    </div>
                  </td>
                  {countries.map((c) => {
                    const inDemand = matrix[prof]?.[c.code] ?? false
                    return (
                      <td key={c.code} className="ph-td ph-cell">
                        {inDemand ? (
                          <span
                            className="ph-dot ph-dot-filled"
                            title={`${prof} is in demand in ${c.name}`}
                          >
                            ●
                          </span>
                        ) : (
                          <span
                            className="ph-dot ph-dot-empty"
                            title={`Not listed in ${c.name}`}
                          >
                            ○
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Summary ────────────────────────────────────────────── */}
      <div className="ph-summary">
        {topProfession && (
          <div className="ph-summary-item">
            <span className="ph-summary-label">
              Most in-demand profession
            </span>
            <span className="ph-summary-value">
              {topProfession.name}
              <span className="ph-summary-sub">
                {' '}
                (listed in {topProfession.count} of {countries.length}{' '}
                countries)
              </span>
            </span>
          </div>
        )}
        {topCountry && (
          <div className="ph-summary-item">
            <span className="ph-summary-label">
              Country with most opportunities
            </span>
            <span className="ph-summary-value">
              {topCountry.name}
              <span className="ph-summary-sub">
                {' '}
                ({topCountry.count} professions in demand)
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

