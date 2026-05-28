'use client'

import { useMemo } from 'react'
import type { CountryComparisonData } from './ComparisonTable'

// ── Types ─────────────────────────────────────────────────────────

interface ProfessionHeatmapProps {
  data: Record<string, CountryComparisonData>
  highlightProfession?: string
}

// ── Constants ─────────────────────────────────────────────────────

const COUNTRY_ORDER = [
  'TT', 'BB', 'JM', 'GY', 'LC', 'GD',
  'DM', 'VC', 'KN', 'AG', 'SR', 'BZ',
]

// ── Helpers ───────────────────────────────────────────────────────

function professionMatches(
  profession: string,
  highlight: string
): boolean {
  const p = profession.toLowerCase()
  const h = highlight.toLowerCase()
  return p.includes(h) || h.includes(p)
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

    return { professions: sorted, matrix, profMap }
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
      <div className="ph-wrap">
        <style>{PH_STYLES}</style>
        <p className="ph-empty">No data available yet.</p>
      </div>
    )
  }

  return (
    <div className="ph-wrap">
      <style>{PH_STYLES}</style>

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

// ── Styles ────────────────────────────────────────────────────────

const PH_STYLES = `
.ph-wrap { font-family: inherit; }

.ph-table-wrap {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 20px;
}

.ph-table {
  border-collapse: collapse;
  white-space: nowrap;
  width: 100%;
}

.ph-th {
  padding: 10px 8px 8px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  text-align: center;
}

.ph-prof-col {
  text-align: left;
  min-width: 185px;
  padding-left: 14px;
}

.ph-country-col {
  min-width: 52px;
  width: 52px;
}

.ph-sticky-col {
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 2;
  box-shadow: 2px 0 4px rgba(0,0,0,0.05);
}

.ph-th.ph-sticky-col {
  background: #f8fafc;
  z-index: 3;
}

.ph-country-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.ph-code {
  font-size: 11px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.03em;
}

.ph-flag {
  width: 22px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid #e5e7eb;
}

.ph-flag-placeholder {
  width: 22px;
  height: 14px;
  background: #e5e7eb;
  border-radius: 2px;
  display: inline-block;
}

.ph-td {
  padding: 9px 8px;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
  vertical-align: middle;
}

.ph-row:last-child .ph-td {
  border-bottom: none;
}

.ph-row:hover .ph-td {
  background: #f8faff;
}
.ph-row:hover .ph-sticky-col {
  background: #f8faff;
}

.ph-row-highlight .ph-td {
  background: #f0fdfa;
}
.ph-row-highlight .ph-sticky-col {
  background: #f0fdfa;
}
.ph-row-highlight:hover .ph-td {
  background: #ccfbf1;
}
.ph-row-highlight:hover .ph-sticky-col {
  background: #ccfbf1;
}

.ph-prof-cell {
  text-align: left;
  padding-left: 14px;
  padding-right: 12px;
}

.ph-prof-inner {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ph-prof-name {
  font-size: 13.5px;
  color: #374151;
  white-space: nowrap;
}

.ph-prof-hl {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: #14b8a6;
  color: #0f766e;
}

.ph-your-label {
  font-size: 10.5px;
  color: #0d9488;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.ph-cell {
  padding: 10px 4px;
}

.ph-dot {
  font-size: 17px;
  line-height: 1;
  display: inline-block;
  user-select: none;
  cursor: default;
}

.ph-dot-filled {
  color: #0d9488;
}

.ph-dot-empty {
  color: #d1d5db;
}

.ph-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ph-summary-item {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.ph-summary-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: #6b7280;
}

.ph-summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.ph-summary-sub {
  font-weight: 400;
  color: #6b7280;
  font-size: 13px;
}

.ph-empty {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  font-size: 14px;
}
`
