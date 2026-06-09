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
import type { CountryComparisonData } from './ComparisonTable'
import { SUPPORTED_CURRENCIES, convertAmount } from '@/lib/currency'

// ── Types ─────────────────────────────────────────────────────────

interface ComparisonChartsProps {
  data: Record<string, CountryComparisonData>
  highlightCountry?: string
  selectedCurrency?: string
  exchangeRates?: Record<string, number> | null
}

// ── Constants ─────────────────────────────────────────────────────

const COLOR_HIGHLIGHT = '#0d9488'
const COLOR_DEFAULT = '#38bdf8'
const BAR_H = 34
const MIN_H = 140

// ── Helpers ───────────────────────────────────────────────────────

function barFill(code: string, highlight?: string): string {
  return code === highlight ? COLOR_HIGHLIGHT : COLOR_DEFAULT
}

function chartHeight(n: number): number {
  return Math.max(MIN_H, n * BAR_H + 24)
}

function fmtTick(v: number, sym: string): string {
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(0)}k`
  return `${sym}${v}`
}

// ── Sub-components ────────────────────────────────────────────────

function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="cc-chart">
      <div className="cc-chart-head">
        <span className="cc-chart-title">{title}</span>
        <span className="cc-chart-sub">{subtitle}</span>
      </div>
      {children}
    </div>
  )
}

function NoData({ label }: { label: string }) {
  return (
    <div className="cc-no-data">
      No {label} data available for selected countries
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="cc-skel">
      {[80, 65, 55, 45, 30].map((w, i) => (
        <div key={i} className="cc-skel-row">
          <div className="cc-skel-label" />
          <div className="cc-skel-bar" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────

export default function ComparisonCharts({
  data,
  highlightCountry,
  selectedCurrency,
  exchangeRates,
}: ComparisonChartsProps) {
  const countries = Object.values(data)
  const isLoading = countries.length === 0

  const activeCurrency =
    SUPPORTED_CURRENCIES.find(
      (c) => c.code === (selectedCurrency ?? 'USD')
    ) ?? SUPPORTED_CURRENCIES[0]

  const rates = exchangeRates ?? {}
  const sym = activeCurrency.symbol
  const currCode = activeCurrency.code

  // GDP per capita — converted, sorted descending
  const gdpData = [...countries]
    .filter((c) => c.stats.gdpPerCapita !== null)
    .map((c) => ({
      code: c.code,
      value: convertAmount(
        c.stats.gdpPerCapita!,
        currCode,
        rates,
        sym
      ).amount,
    }))
    .sort((a, b) => b.value - a.value)

  // Monthly living cost — converted, sorted descending
  const costData = [...countries]
    .filter((c) => c.costOfLiving.monthlyTotal !== null)
    .map((c) => ({
      code: c.code,
      value: convertAmount(
        Math.round(c.costOfLiving.monthlyTotal!),
        currCode,
        rates,
        sym
      ).amount,
    }))
    .sort((a, b) => b.value - a.value)

  // CSME min processing weeks — no currency conversion, sorted ascending
  const csmeData = [...countries]
    .filter((c) => c.csme !== null)
    .map((c) => ({ code: c.code, value: c.csme!.processingWeeks.min }))
    .sort((a, b) => a.value - b.value)

  const tooltipStyle = {
    fontSize: 13,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
  }

  return (
    <div className="cc-wrap">
      <style>{CC_STYLES}</style>

      <div className="cc-grid">

        {/* ── GDP per Capita ───────────────────────────────── */}
        <ChartShell
          title="GDP per Capita"
          subtitle={`${currCode} · World Bank`}
        >
          {isLoading ? (
            <ChartSkeleton />
          ) : gdpData.length === 0 ? (
            <NoData label="GDP" />
          ) : (
            <ResponsiveContainer
              width="100%"
              height={chartHeight(gdpData.length)}
            >
              <BarChart
                data={gdpData}
                layout="vertical"
                margin={{ top: 4, right: 48, bottom: 4, left: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v: number) => fmtTick(v, sym)}
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
                  formatter={(v) =>
                    typeof v === 'number'
                      ? [`${sym}${v.toLocaleString()}`, 'GDP / capita']
                      : [String(v), 'GDP / capita']
                  }
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {gdpData.map((entry) => (
                    <Cell
                      key={entry.code}
                      fill={barFill(entry.code, highlightCountry)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartShell>

        {/* ── Monthly Living Cost ──────────────────────────── */}
        <ChartShell
          title="Monthly Living Cost"
          subtitle={`${currCode} · mid budget estimate`}
        >
          {isLoading ? (
            <ChartSkeleton />
          ) : costData.length === 0 ? (
            <NoData label="cost of living" />
          ) : (
            <ResponsiveContainer
              width="100%"
              height={chartHeight(costData.length)}
            >
              <BarChart
                data={costData}
                layout="vertical"
                margin={{ top: 4, right: 48, bottom: 4, left: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v: number) => fmtTick(v, sym)}
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
                  formatter={(v) =>
                    typeof v === 'number'
                      ? [`${sym}${v.toLocaleString()} / mo`, 'Monthly cost']
                      : [String(v), 'Monthly cost']
                  }
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {costData.map((entry) => (
                    <Cell
                      key={entry.code}
                      fill={barFill(entry.code, highlightCountry)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartShell>

        {/* ── CSME Processing Time (no conversion) ─────────── */}
        <ChartShell
          title="CSME Processing Time"
          subtitle="Minimum weeks · shorter is better"
        >
          {isLoading ? (
            <ChartSkeleton />
          ) : csmeData.length === 0 ? (
            <NoData label="CSME" />
          ) : (
            <ResponsiveContainer
              width="100%"
              height={chartHeight(csmeData.length)}
            >
              <BarChart
                data={csmeData}
                layout="vertical"
                margin={{ top: 4, right: 48, bottom: 4, left: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v: number) => `${v}w`}
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
                  formatter={(v) =>
                    typeof v === 'number'
                      ? [`${v} weeks minimum`, 'Processing time']
                      : [String(v), 'Processing time']
                  }
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {csmeData.map((entry) => (
                    <Cell
                      key={entry.code}
                      fill={barFill(entry.code, highlightCountry)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartShell>

      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────

const CC_STYLES = `
.cc-wrap { font-family: inherit; }

.cc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* First chart spans full width */
.cc-grid .cc-chart:first-child {
  grid-column: 1 / -1;
}

.cc-chart {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 12px 12px;
  overflow: hidden;
}

.cc-chart-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 12px;
}

.cc-chart-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.cc-chart-sub {
  font-size: 11.5px;
  color: #6b7280;
}

.cc-no-data {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
}

.cc-skel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 8px 0;
}

.cc-skel-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cc-skel-label {
  width: 28px;
  height: 14px;
  border-radius: 4px;
  background: #e5e7eb;
  flex-shrink: 0;
  animation: cc-shimmer 1.4s ease-in-out infinite;
}

.cc-skel-bar {
  height: 24px;
  border-radius: 4px;
  background: #e5e7eb;
  animation: cc-shimmer 1.4s ease-in-out infinite;
}

@keyframes cc-shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@media (max-width: 680px) {
  .cc-grid { grid-template-columns: 1fr; }
  .cc-grid .cc-chart:first-child { grid-column: auto; }
}
`
