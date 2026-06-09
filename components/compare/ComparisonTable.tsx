'use client'

import { useState, useMemo } from 'react'
import { SUPPORTED_CURRENCIES, convertAmount } from '@/lib/currency'
import type { CountryComparisonData } from '@/lib/types/comparison'
import { COMPLEXITY_ORDER, complexityColor, complexityBg } from '@/lib/badge'
import { fmtPop, capitalize } from '@/lib/format'

export type { CountryComparisonData }

type SortKey =
  | 'name'
  | 'gdpPerCapita'
  | 'population'
  | 'monthlyTotal'
  | 'safetyScore'
  | 'healthcareScore'
  | 'qualityOfLifeScore'
  | 'csmeComplexity'
  | 'processingWeeks'

type ComplexityFilter = 'all' | 'easy' | 'moderate' | 'hard'

export interface ComparisonTableProps {
  data: Record<string, CountryComparisonData>
  userCategory?: string
  highlightCountry?: string
  selectedCurrency?: string
  exchangeRates?: Record<string, number> | null
}

// ── Helpers ───────────────────────────────────────────────────────

function professionMatch(
  professions: string[],
  category: string
): boolean {
  const cat = category.toLowerCase()
  return professions.some(
    (p) =>
      p.toLowerCase().includes(cat) || cat.includes(p.toLowerCase())
  )
}

// ── Sub-components ────────────────────────────────────────────────

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
      <div className="ct-card-body">
        <div className="ct-card-label">{label}</div>
        <div className="ct-card-country">{country.name}</div>
        <div className="ct-card-detail">{detail}</div>
      </div>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="ct-skeleton">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="ct-skel-row">
          <div className="ct-skel-cell ct-skel-flag" />
          {Array.from({ length: 8 }).map((_, j) => (
            <div key={j} className="ct-skel-cell" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────

export default function ComparisonTable({
  data,
  userCategory,
  highlightCountry,
  selectedCurrency,
  exchangeRates,
}: ComparisonTableProps) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [complexityFilter, setComplexityFilter] =
    useState<ComplexityFilter>('all')

  const activeCurrency =
    SUPPORTED_CURRENCIES.find(
      (c) => c.code === (selectedCurrency ?? 'USD')
    ) ?? SUPPORTED_CURRENCIES[0]
  const isUSD = activeCurrency.code === 'USD'
  const rates = exchangeRates ?? {}

  function conv(usdAmount: number | null): string {
    if (usdAmount === null) return '–'
    return convertAmount(
      usdAmount,
      activeCurrency.code,
      rates,
      activeCurrency.symbol
    ).formatted
  }

  const allCountries = useMemo(() => Object.values(data), [data])

  const filtered = useMemo(() => {
    let list = allCountries

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q)
      )
    }

    if (complexityFilter !== 'all') {
      list = list.filter(
        (c) => c.csme?.complexity === complexityFilter
      )
    }

    return [...list].sort((a, b) => {
      let aVal: number | string = 0
      let bVal: number | string = 0

      switch (sortBy) {
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'gdpPerCapita':
          aVal = a.stats.gdpPerCapita ?? -1
          bVal = b.stats.gdpPerCapita ?? -1
          break
        case 'population':
          aVal = a.stats.population ?? -1
          bVal = b.stats.population ?? -1
          break
        case 'monthlyTotal':
          aVal = a.costOfLiving.monthlyTotal ?? -1
          bVal = b.costOfLiving.monthlyTotal ?? -1
          break
        case 'safetyScore':
          aVal = a.qualityOfLife.safetyScore ?? -1
          bVal = b.qualityOfLife.safetyScore ?? -1
          break
        case 'healthcareScore':
          aVal = a.qualityOfLife.healthcareScore ?? -1
          bVal = b.qualityOfLife.healthcareScore ?? -1
          break
        case 'qualityOfLifeScore':
          aVal = a.qualityOfLife.qualityOfLifeScore ?? -1
          bVal = b.qualityOfLife.qualityOfLifeScore ?? -1
          break
        case 'csmeComplexity':
          aVal = COMPLEXITY_ORDER[a.csme?.complexity ?? 'moderate']
          bVal = COMPLEXITY_ORDER[b.csme?.complexity ?? 'moderate']
          break
        case 'processingWeeks':
          aVal = a.csme?.processingWeeks.min ?? 99
          bVal = b.csme?.processingWeeks.min ?? 99
          break
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }, [allCountries, search, complexityFilter, sortBy, sortDir])

  function handleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
  }

  function sortArrow(key: SortKey) {
    if (sortBy !== key) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  // ── Summary card data ─────────────────────────────────────────

  const easiestCSME = [...allCountries]
    .filter((c) => c.csme)
    .sort(
      (a, b) =>
        COMPLEXITY_ORDER[a.csme!.complexity] -
          COMPLEXITY_ORDER[b.csme!.complexity] ||
        a.csme!.processingWeeks.min - b.csme!.processingWeeks.min
    )[0]

  const mostAffordable = [...allCountries]
    .filter((c) => c.costOfLiving.monthlyTotal !== null)
    .sort(
      (a, b) =>
        (a.costOfLiving.monthlyTotal ?? 9999) -
        (b.costOfLiving.monthlyTotal ?? 9999)
    )[0]

  const bestProfessionMatch =
    userCategory
      ? [...allCountries]
          .filter(
            (c) =>
              c.csme &&
              professionMatch(c.csme.inDemandProfessions, userCategory)
          )
          .sort(
            (a, b) =>
              COMPLEXITY_ORDER[a.csme!.complexity] -
              COMPLEXITY_ORDER[b.csme!.complexity]
          )[0] ?? null
      : null

  if (allCountries.length === 0) {
    return (
      <div className="ct-wrap">
        <style>{CT_STYLES}</style>
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="ct-wrap">
      <style>{CT_STYLES}</style>

      {/* ── Filter bar ─────────────────────────────────────────── */}
      <div className="ct-filters">
        <input
          className="ct-search"
          type="search"
          placeholder="Search countries…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="ct-sort-group">
          <select
            className="ct-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortKey)
              setSortDir('asc')
            }}
          >
            <option value="name">Name</option>
            <option value="gdpPerCapita">GDP / capita</option>
            <option value="population">Population</option>
            <option value="monthlyTotal">Monthly cost</option>
            <option value="safetyScore">Safety score</option>
            <option value="healthcareScore">Healthcare score</option>
            <option value="qualityOfLifeScore">QoL score</option>
            <option value="csmeComplexity">CSME complexity</option>
            <option value="processingWeeks">Processing time</option>
          </select>
          <button
            className="ct-dir-btn"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            title={`Sort ${sortDir === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="ct-pills">
          {(['all', 'easy', 'moderate', 'hard'] as const).map((f) => (
            <button
              key={f}
              className={`ct-pill${complexityFilter === f ? ' ct-pill-active' : ''}`}
              onClick={() => setComplexityFilter(f)}
            >
              {f === 'all' ? 'All' : capitalize(f)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className="ct-table-wrap">
        <table className="ct-table">
          <thead>
            <tr>
              <th
                className="ct-th ct-sticky-col"
                onClick={() => handleSort('name')}
              >
                Country{sortArrow('name')}
              </th>
              <th
                className="ct-th ct-num"
                onClick={() => handleSort('gdpPerCapita')}
              >
                GDP/capita{sortArrow('gdpPerCapita')}
              </th>
              <th
                className="ct-th ct-num"
                onClick={() => handleSort('population')}
              >
                Population{sortArrow('population')}
              </th>
              <th
                className="ct-th ct-num"
                onClick={() => handleSort('monthlyTotal')}
              >
                Monthly cost
                {!isUSD && (
                  <span className="ct-currency-badge">
                    {activeCurrency.code}
                  </span>
                )}
                {sortArrow('monthlyTotal')}
              </th>
              <th className="ct-th ct-num">
                Rent (1-bed)
                {!isUSD && (
                  <span className="ct-currency-badge">
                    {activeCurrency.code}
                  </span>
                )}
              </th>
              <th
                className="ct-th"
                onClick={() => handleSort('csmeComplexity')}
              >
                CSME{sortArrow('csmeComplexity')}
              </th>
              <th
                className="ct-th ct-num"
                onClick={() => handleSort('processingWeeks')}
              >
                Processing{sortArrow('processingWeeks')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="ct-empty">
                  No countries match your filters.
                </td>
              </tr>
            )}
            {filtered.map((c) => {
              const isHighlighted = c.code === highlightCountry
              const hasMatch =
                userCategory &&
                c.csme &&
                professionMatch(c.csme.inDemandProfessions, userCategory)

              return (
                <tr
                  key={c.code}
                  className={`ct-row${isHighlighted ? ' ct-row-highlight' : ''}`}
                >
                  <td className="ct-td ct-sticky-col ct-country-cell">
                    {c.flag ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.flag}
                        alt={c.flagAlt}
                        className="ct-flag"
                        loading="lazy"
                      />
                    ) : (
                      <span className="ct-flag-placeholder">{c.code}</span>
                    )}
                    <span className="ct-country-name">{c.name}</span>
                    {hasMatch && (
                      <span
                        className="ct-star"
                        title={`${userCategory} is in demand here`}
                      >
                        ★
                      </span>
                    )}
                  </td>
                  <td className="ct-td ct-num">
                    {c.stats.gdpPerCapita
                      ? `$${c.stats.gdpPerCapita.toLocaleString()}`
                      : '–'}
                  </td>
                  <td className="ct-td ct-num">
                    {fmtPop(c.stats.population)}
                  </td>
                  <td className="ct-td ct-num">
                    {conv(
                      c.costOfLiving.monthlyTotal !== null
                        ? Math.round(c.costOfLiving.monthlyTotal)
                        : null
                    )}
                  </td>
                  <td className="ct-td ct-num">
                    {(() => {
                      const rMin = c.costOfLiving.rentOneBedMin
                      const rMax = c.costOfLiving.rentOneBedMax
                      if (!rMin || !rMax) return '–'
                      const min = convertAmount(
                        Math.round(rMin),
                        activeCurrency.code,
                        rates,
                        activeCurrency.symbol
                      )
                      const max = convertAmount(
                        Math.round(rMax),
                        activeCurrency.code,
                        rates,
                        activeCurrency.symbol
                      )
                      return `${min.symbol}${min.amount.toLocaleString()}–${max.amount.toLocaleString()}`
                    })()}
                  </td>
                  <td className="ct-td">
                    {c.csme ? (
                      <span
                        className="ct-badge"
                        style={{
                          color: complexityColor(c.csme.complexity),
                          background: complexityBg(c.csme.complexity),
                        }}
                      >
                        {capitalize(c.csme.complexity)}
                      </span>
                    ) : (
                      '–'
                    )}
                  </td>
                  <td className="ct-td ct-num">
                    {c.csme
                      ? `${c.csme.processingWeeks.min}–${c.csme.processingWeeks.max} wks`
                      : '–'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Summary cards ──────────────────────────────────────── */}
      <div className="ct-cards">
        {easiestCSME && (
          <SummaryCard
            emoji="✅"
            label="Easiest CSME"
            country={easiestCSME}
            detail={`${easiestCSME.csme!.processingWeeks.min}–${easiestCSME.csme!.processingWeeks.max} wks`}
          />
        )}
        {mostAffordable && (
          <SummaryCard
            emoji="💰"
            label="Most affordable"
            country={mostAffordable}
            detail={`${conv(Math.round(mostAffordable.costOfLiving.monthlyTotal!))}/mo`}
          />
        )}
        {bestProfessionMatch && (
          <SummaryCard
            emoji="⭐"
            label={`Best for ${userCategory}`}
            country={bestProfessionMatch}
            detail={`${capitalize(bestProfessionMatch.csme!.complexity)} CSME process`}
          />
        )}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────

const CT_STYLES = `
.ct-wrap { font-family: inherit; }

.ct-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}

.ct-search {
  flex: 1;
  min-width: 180px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background: #fff;
  font-family: inherit;
}
.ct-search:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 2px rgba(14,165,233,0.15);
}

.ct-sort-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.ct-select {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
  outline: none;
  font-family: inherit;
}

.ct-dir-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  transition: background 0.15s;
  font-family: inherit;
}
.ct-dir-btn:hover { background: #f3f4f6; }

.ct-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.ct-pill {
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.ct-pill:hover { background: #f3f4f6; }
.ct-pill-active {
  background: #0c4a6e;
  color: #fff;
  border-color: #0c4a6e;
}

.ct-table-wrap {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 24px;
}

.ct-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  white-space: nowrap;
}

.ct-th {
  padding: 10px 14px;
  background: #f8fafc;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  user-select: none;
}
.ct-th:hover { background: #f1f5f9; }

.ct-td {
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: #374151;
  vertical-align: middle;
}

.ct-sticky-col {
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 1;
  min-width: 190px;
  box-shadow: 2px 0 4px rgba(0,0,0,0.04);
}
.ct-th.ct-sticky-col {
  background: #f8fafc;
  z-index: 2;
}

.ct-row:last-child .ct-td { border-bottom: none; }

.ct-row:hover .ct-td { background: #f8faff; }
.ct-row:hover .ct-sticky-col { background: #f8faff; }

.ct-row-highlight .ct-td { background: #f0f9ff; }
.ct-row-highlight .ct-sticky-col { background: #f0f9ff; }
.ct-row-highlight:hover .ct-td { background: #e0f2fe; }
.ct-row-highlight:hover .ct-sticky-col { background: #e0f2fe; }

.ct-num { text-align: right; }

.ct-country-cell {
  display: flex !important;
  align-items: center;
  gap: 8px;
}

.ct-flag {
  width: 22px;
  height: 15px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.ct-flag-placeholder {
  width: 22px;
  height: 15px;
  background: #e5e7eb;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #9ca3af;
  flex-shrink: 0;
}

.ct-country-name { font-weight: 500; }

.ct-star {
  color: #f59e0b;
  font-size: 13px;
  cursor: default;
  flex-shrink: 0;
}

.ct-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.ct-currency-badge {
  display: inline-block;
  margin: 0 3px;
  padding: 1px 5px;
  border-radius: 4px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 10px;
  font-weight: 700;
  vertical-align: middle;
  letter-spacing: 0.02em;
}

.ct-empty {
  text-align: center;
  padding: 32px;
  color: #9ca3af;
  font-style: italic;
}

.ct-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.ct-card {
  display: flex;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  align-items: flex-start;
}

.ct-card-emoji {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 1px;
}

.ct-card-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
  margin-bottom: 2px;
}

.ct-card-country {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.ct-card-detail {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.ct-skeleton {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 24px;
}

.ct-skel-row {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.ct-skel-row:last-child { border-bottom: none; }

.ct-skel-cell {
  height: 16px;
  flex: 1;
  border-radius: 4px;
  background: #e5e7eb;
  animation: ct-shimmer 1.4s ease-in-out infinite;
}

.ct-skel-flag {
  flex: 0 0 90px;
}

@keyframes ct-shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (max-width: 640px) {
  .ct-filters { flex-direction: column; align-items: stretch; }
  .ct-sort-group { justify-content: space-between; }
  .ct-cards { grid-template-columns: 1fr 1fr; }
}
`
