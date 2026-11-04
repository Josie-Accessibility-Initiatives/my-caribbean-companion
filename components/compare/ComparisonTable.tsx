'use client'

import { useState, useMemo } from 'react'
import { convertAmount, getCurrencyMeta } from '@/lib/currency'
import type { CountryComparisonData } from '@/lib/types/comparison'
import { COMPLEXITY_ORDER, complexityColor, complexityBg } from '@/lib/badge'
import { fmtPop, capitalize } from '@/lib/format'
import { professionMatches } from '@/lib/country-utils'
import ComparisonSummary from '@/components/compare/ComparisonSummary'
import { TableSkeleton } from '@/components/ui/Skeleton'

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

/** Sort value per column; missing numbers sort first ascending. */
const SORT_VALUE: Record<SortKey, (c: CountryComparisonData) => number | string> = {
  name: (c) => c.name,
  gdpPerCapita: (c) => c.stats.gdpPerCapita ?? -1,
  population: (c) => c.stats.population ?? -1,
  monthlyTotal: (c) => c.costOfLiving.monthlyTotal ?? -1,
  safetyScore: (c) => c.qualityOfLife.safetyScore ?? -1,
  healthcareScore: (c) => c.qualityOfLife.healthcareScore ?? -1,
  qualityOfLifeScore: (c) => c.qualityOfLife.qualityOfLifeScore ?? -1,
  csmeComplexity: (c) => COMPLEXITY_ORDER[c.csme?.complexity ?? 'moderate'],
  processingWeeks: (c) => c.csme?.processingWeeks.min ?? 99,
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'gdpPerCapita', label: 'GDP / capita' },
  { value: 'population', label: 'Population' },
  { value: 'monthlyTotal', label: 'Monthly cost' },
  { value: 'safetyScore', label: 'Safety score' },
  { value: 'healthcareScore', label: 'Healthcare score' },
  { value: 'qualityOfLifeScore', label: 'QoL score' },
  { value: 'csmeComplexity', label: 'CSME complexity' },
  { value: 'processingWeeks', label: 'Processing time' },
]

const COMPLEXITY_FILTERS: ComplexityFilter[] = ['all', 'easy', 'moderate', 'hard']

function compare(a: number | string, b: number | string): number {
  return typeof a === 'string' && typeof b === 'string'
    ? a.localeCompare(b)
    : (a as number) - (b as number)
}

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
  const [complexityFilter, setComplexityFilter] = useState<ComplexityFilter>('all')

  const currency = getCurrencyMeta(selectedCurrency ?? 'USD')
  const isUSD = currency.code === 'USD'
  const rates = exchangeRates ?? {}
  const convert = (usd: number) => convertAmount(usd, currency.code, rates, currency.symbol)
  const formatMoney = (usd: number | null) => (usd === null ? '–' : convert(usd).formatted)

  const allCountries = useMemo(() => Object.values(data), [data])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const value = SORT_VALUE[sortBy]
    return allCountries
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q)
      )
      .filter((c) => complexityFilter === 'all' || c.csme?.complexity === complexityFilter)
      .sort((a, b) => (sortDir === 'asc' ? 1 : -1) * compare(value(a), value(b)))
  }, [allCountries, search, complexityFilter, sortBy, sortDir])

  function handleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortDir('asc')
    }
  }

  const sortArrow = (key: SortKey) => (sortBy !== key ? ' ↕' : sortDir === 'asc' ? ' ↑' : ' ↓')
  const currencyBadge = !isUSD && <span className="ct-currency-badge">{currency.code}</span>

  const isInDemand = (c: CountryComparisonData) =>
    !!userCategory &&
    !!c.csme?.inDemandProfessions.some((p) => professionMatches(p, userCategory))

  const rentRange = (c: CountryComparisonData) => {
    const { rentOneBedMin: rMin, rentOneBedMax: rMax } = c.costOfLiving
    if (!rMin || !rMax) return '–'
    const min = convert(Math.round(rMin))
    const max = convert(Math.round(rMax))
    return `${min.symbol}${min.amount.toLocaleString()}–${max.amount.toLocaleString()}`
  }

  if (allCountries.length === 0) {
    return <TableSkeleton />
  }

  return (
    <div>
      {/* ── Filter bar ── */}
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
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ct-dir-btn"
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            title={`Sort ${sortDir === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="ct-pills">
          {COMPLEXITY_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`ct-pill${complexityFilter === f ? ' ct-pill-active' : ''}`}
              onClick={() => setComplexityFilter(f)}
            >
              {f === 'all' ? 'All' : capitalize(f)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="ct-table-wrap">
        <table className="ct-table">
          <thead>
            <tr>
              <th className="ct-th ct-sticky-col" onClick={() => handleSort('name')}>
                Country{sortArrow('name')}
              </th>
              <th className="ct-th ct-num" onClick={() => handleSort('gdpPerCapita')}>
                GDP/capita{sortArrow('gdpPerCapita')}
              </th>
              <th className="ct-th ct-num" onClick={() => handleSort('population')}>
                Population{sortArrow('population')}
              </th>
              <th className="ct-th ct-num" onClick={() => handleSort('monthlyTotal')}>
                Monthly cost{currencyBadge}
                {sortArrow('monthlyTotal')}
              </th>
              <th className="ct-th ct-num">Rent (1-bed){currencyBadge}</th>
              <th className="ct-th" onClick={() => handleSort('csmeComplexity')}>
                CSME{sortArrow('csmeComplexity')}
              </th>
              <th className="ct-th ct-num" onClick={() => handleSort('processingWeeks')}>
                Processing{sortArrow('processingWeeks')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="ct-empty">
                  No countries match your filters.
                </td>
              </tr>
            )}
            {rows.map((c) => (
              <tr
                key={c.code}
                className={`ct-row${c.code === highlightCountry ? ' ct-row-highlight' : ''}`}
              >
                <td className="ct-td ct-sticky-col ct-country-cell">
                  {c.flag ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.flag} alt={c.flagAlt} className="ct-flag" loading="lazy" />
                  ) : (
                    <span className="ct-flag-placeholder">{c.code}</span>
                  )}
                  <span className="ct-country-name">{c.name}</span>
                  {isInDemand(c) && (
                    <span className="ct-star" title={`${userCategory} is in demand here`}>
                      ★
                    </span>
                  )}
                </td>
                <td className="ct-td ct-num">
                  {c.stats.gdpPerCapita ? `$${c.stats.gdpPerCapita.toLocaleString()}` : '–'}
                </td>
                <td className="ct-td ct-num">{fmtPop(c.stats.population)}</td>
                <td className="ct-td ct-num">
                  {formatMoney(
                    c.costOfLiving.monthlyTotal !== null
                      ? Math.round(c.costOfLiving.monthlyTotal)
                      : null
                  )}
                </td>
                <td className="ct-td ct-num">{rentRange(c)}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      <ComparisonSummary
        countries={allCountries}
        userCategory={userCategory}
        formatMoney={(usd) => formatMoney(usd)}
      />
    </div>
  )
}
