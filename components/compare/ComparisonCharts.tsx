'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { CountryComparisonData } from '@/lib/types/comparison'
import { convertAmount, getCurrencyMeta } from '@/lib/currency'
import { fmtTick } from '@/lib/format'

interface ComparisonChartsProps {
  data: Record<string, CountryComparisonData>
  highlightCountry?: string
  selectedCurrency?: string
  exchangeRates?: Record<string, number> | null
}

type ChartPoint = { code: string; value: number }

const COLOR_HIGHLIGHT = 'var(--color-primary)'
const COLOR_DEFAULT = '#38bdf8'
const BAR_H = 34
const MIN_H = 140
const SKELETON_WIDTHS = [80, 65, 55, 45, 30]

function ChartSkeleton() {
  return (
    <div className="cc-skel">
      {SKELETON_WIDTHS.map((w) => (
        <div key={w} className="cc-skel-row">
          <div className="cc-skel-label" />
          <div className="cc-skel-bar" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

/** One card with a horizontal bar chart of a value per country code. */
function CountryBarChart({
  title,
  subtitle,
  data,
  loading,
  noDataLabel,
  highlightCountry,
  tickFormatter,
  tooltipValue,
  tooltipLabel,
}: {
  title: string
  subtitle: string
  data: ChartPoint[]
  loading: boolean
  noDataLabel: string
  highlightCountry?: string
  tickFormatter: (v: number) => string
  tooltipValue: (v: number) => string
  tooltipLabel: string
}) {
  return (
    <div className="cc-chart">
      <div className="cc-chart-head">
        <span className="cc-chart-title">{title}</span>
        <span className="cc-chart-sub">{subtitle}</span>
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : data.length === 0 ? (
        <div className="cc-no-data">No {noDataLabel} data available for selected countries</div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(MIN_H, data.length * BAR_H + 24)}>
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickFormatter={tickFormatter}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="code"
              width={32}
              tick={{ fontSize: 12, fontWeight: 600, fill: '#374151' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => [typeof v === 'number' ? tooltipValue(v) : String(v), tooltipLabel]}
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.code}
                  fill={entry.code === highlightCountry ? COLOR_HIGHLIGHT : COLOR_DEFAULT}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default function ComparisonCharts({
  data,
  highlightCountry,
  selectedCurrency,
  exchangeRates,
}: ComparisonChartsProps) {
  const countries = Object.values(data)
  const loading = countries.length === 0
  const { code: currency, symbol } = getCurrencyMeta(selectedCurrency ?? 'USD')
  const rates = exchangeRates ?? {}

  /** Collect one value per country, skipping nulls, converted when `convert` is set. */
  const series = (
    pick: (c: CountryComparisonData) => number | null | undefined,
    { convert = false, ascending = false } = {}
  ): ChartPoint[] =>
    countries
      .map((c) => ({ code: c.code, raw: pick(c) }))
      .filter((p): p is { code: string; raw: number } => p.raw != null)
      .map(({ code, raw }) => ({
        code,
        value: convert ? convertAmount(Math.round(raw), currency, rates, symbol).amount : raw,
      }))
      .sort((a, b) => (ascending ? a.value - b.value : b.value - a.value))

  const shared = { loading, highlightCountry }

  return (
    <div className="cc-grid">
      <CountryBarChart
        {...shared}
        title="GDP per Capita"
        subtitle={`${currency} · World Bank`}
        data={series((c) => c.stats.gdpPerCapita, { convert: true })}
        noDataLabel="GDP"
        tickFormatter={(v) => fmtTick(v, symbol)}
        tooltipValue={(v) => `${symbol}${v.toLocaleString()}`}
        tooltipLabel="GDP / capita"
      />
      <CountryBarChart
        {...shared}
        title="Monthly Living Cost"
        subtitle={`${currency} · mid budget estimate`}
        data={series((c) => c.costOfLiving.monthlyTotal, { convert: true })}
        noDataLabel="cost of living"
        tickFormatter={(v) => fmtTick(v, symbol)}
        tooltipValue={(v) => `${symbol}${v.toLocaleString()} / mo`}
        tooltipLabel="Monthly cost"
      />
      <CountryBarChart
        {...shared}
        title="CSME Processing Time"
        subtitle="Minimum weeks · shorter is better"
        data={series((c) => c.csme?.processingWeeks.min, { ascending: true })}
        noDataLabel="CSME"
        tickFormatter={(v) => `${v}w`}
        tooltipValue={(v) => `${v} weeks minimum`}
        tooltipLabel="Processing time"
      />
    </div>
  )
}
