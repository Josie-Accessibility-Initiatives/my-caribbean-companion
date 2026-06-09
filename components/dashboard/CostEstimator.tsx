'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Plane,
  Home,
  Building2,
  FileText,
  Package,
  ShoppingCart,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ── Types ─────────────────────────────────────────────────────────

type BudgetLevel = 'budget' | 'mid' | 'comfortable'

type CostEstimateResponse = {
  fromCountry: { code: string; name: string; capital: string }
  toCountry: { code: string; name: string; capital: string; currency: string }
  budgetLevel: string
  breakdown: {
    flights: {
      amount: number
      min: number
      max: number
      source: 'tavily' | 'fallback'
      googleFlightsUrl: string
      airlines: string[]
    }
    housingDeposit: { amount: number; note: string }
    temporaryAccommodation: {
      amount: number
      nights: number
      perNight: number
      bookingComUrl: string
    }
    documentFees: {
      amount: number
      breakdown: {
        skillsCertificate: number
        policeCertificate: number
        medicalCertificate: number
        notarization: number
        translation: number
      }
    }
    shipping: { amount: number; note: string }
    firstMonthLiving: {
      amount: number
      breakdown: {
        rent: number
        groceries: number
        transport: number
        utilities: number
      }
    }
    emergencyBuffer: { amount: number; months: number }
  }
  totals: {
    usd: number
    local: { amount: number; formatted: string; currency: string } | null
  }
  savingsTip: string
  disclaimer: string
  generatedAt: string
}

export interface CostEstimatorProps {
  fromCountry: string
  toCountry: string
  toCountryName: string
  category?: string
  onViewed?: () => void
}

// ── Constants ─────────────────────────────────────────────────────

const TEAL = '#117F74'

const BUDGET_LABELS: Record<BudgetLevel, string> = {
  budget: 'Budget',
  mid: 'Mid-Range',
  comfortable: 'Comfortable',
}

// ── Helpers ───────────────────────────────────────────────────────

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function fmtRange(min: number, max: number) {
  return `$${Math.round(min).toLocaleString()} – $${Math.round(max).toLocaleString()} USD`
}

// ── Sub-components ────────────────────────────────────────────────

function SourceBadge({ source }: { source: 'tavily' | 'fallback' }) {
  const live = source === 'tavily'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        fontSize: '0.7rem',
        padding: '0.1rem 0.45rem',
        borderRadius: '999px',
        background: live ? '#d1fae5' : '#f3f4f6',
        color: live ? '#065f46' : '#6b7280',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: live ? '#10b981' : '#9ca3af',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {live ? 'Live' : 'Estimated'}
    </span>
  )
}

type LineItemProps = {
  icon: React.ReactNode
  label: string
  description: React.ReactNode
  amount: number
  source: 'tavily' | 'fallback'
  isLast?: boolean
  extra?: React.ReactNode
}

function LineItem({
  icon,
  label,
  description,
  amount,
  source,
  isLast,
  extra,
}: LineItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '0.875rem 0',
        borderBottom: isLast ? undefined : '1px solid #f3f4f6',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ color: TEAL, flexShrink: 0, marginTop: 2 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '0.2rem',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
          <SourceBadge source={source} />
        </div>
        {description}
        {extra}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '0.5rem' }}>
        <span style={{ fontWeight: 700, color: TEAL, fontSize: '0.95rem' }}>
          {fmt(amount)}
        </span>
      </div>
    </div>
  )
}

function Skel({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: '#e5e7eb',
        borderRadius: '0.375rem',
        animation: 'ce-pulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

function LoadingSkeleton() {
  return (
    <>
      <Skel style={{ height: 144, borderRadius: '0.75rem', marginBottom: '1.5rem' }} />
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '0.875rem 0',
            borderBottom: i < 6 ? '1px solid #f3f4f6' : undefined,
            alignItems: 'center',
          }}
        >
          <Skel style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skel style={{ height: 14, width: '42%', marginBottom: '0.4rem' }} />
            <Skel style={{ height: 12, width: '62%' }} />
          </div>
          <Skel style={{ height: 18, width: 68, borderRadius: '0.25rem' }} />
        </div>
      ))}
      <Skel style={{ height: 300, borderRadius: '0.75rem', marginTop: '1.5rem', marginBottom: '1.5rem' }} />
      <Skel style={{ height: 82, borderRadius: '0.75rem' }} />
    </>
  )
}

// ── Main component ────────────────────────────────────────────────

export default function CostEstimator({
  fromCountry,
  toCountry,
  toCountryName,
  category,
  onViewed,
}: CostEstimatorProps) {
  const [data, setData] = useState<CostEstimateResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('mid')
  const [expandedLiving, setExpandedLiving] = useState(false)
  const viewedRef = useRef(false)

  async function fetchEstimate(level: BudgetLevel) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cost-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCountry,
          toCountry,
          category,
          budgetLevel: level,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? 'Failed to load estimate')
      }
      setData(json)
      if (!viewedRef.current) {
        onViewed?.()
        viewedRef.current = true
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load cost estimate.'
      )
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchEstimate('mid') }, [])

  function handleBudgetChange(level: BudgetLevel) {
    setBudgetLevel(level)
    fetchEstimate(level)
  }

  const chartData = data
    ? [
        { name: 'Flights', amount: data.breakdown.flights.amount },
        { name: 'Housing Deposit', amount: data.breakdown.housingDeposit.amount },
        { name: 'Temp. Stay', amount: data.breakdown.temporaryAccommodation.amount },
        { name: 'Documents', amount: data.breakdown.documentFees.amount },
        { name: 'Shipping', amount: data.breakdown.shipping.amount },
        { name: 'Month 1 Living', amount: data.breakdown.firstMonthLiving.amount },
        { name: 'Emergency Fund', amount: data.breakdown.emergencyBuffer.amount },
      ]
    : []

  const liveSource = data?.breakdown.flights.source ?? 'fallback'

  return (
    <div className="planner-card">
      <style>{`
        @keyframes ce-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Header */}
      <p
        className="dashboard-eyebrow"
        style={{ marginTop: 0, marginBottom: '0.4rem' }}
      >
        Cost Estimator
      </p>
      <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.15rem', fontWeight: 700 }}>
        {toCountryName} Relocation Budget
      </h2>
      <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: '#6b7280' }}>
        {fromCountry} → {toCountry} · CSME Free Movement of Skills
      </p>

      {/* Section 1 — Budget selector */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {(Object.keys(BUDGET_LABELS) as BudgetLevel[]).map((level) => {
          const active = budgetLevel === level
          return (
            <button
              key={level}
              onClick={() => handleBudgetChange(level)}
              disabled={loading}
              style={{
                padding: '0.4rem 1.1rem',
                borderRadius: '999px',
                border: `1px solid ${active ? TEAL : '#d1d5db'}`,
                background: active ? TEAL : '#ffffff',
                color: active ? '#ffffff' : '#374151',
                fontWeight: active ? 600 : 400,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.65 : 1,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              {BUDGET_LABELS[level]}
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Error */}
      {!loading && error && (
        <div
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '0.75rem',
            padding: '1.75rem',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 1rem', color: '#991b1b', fontWeight: 500 }}>
            Unable to load cost estimate.
          </p>
          <button
            onClick={() => fetchEstimate(budgetLevel)}
            className="btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Data */}
      {!loading && !error && data && (
        <>
          {/* Section 2 — Total banner */}
          <div
            style={{
              background: TEAL,
              borderRadius: '0.75rem',
              padding: '1.5rem 1.75rem',
              color: '#ffffff',
              marginBottom: '1.75rem',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: '0 0 0.3rem',
                fontSize: '0.75rem',
                opacity: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 600,
              }}
            >
              Estimated Relocation Cost
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '2.6rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {fmt(data.totals.usd)} USD
            </p>
            {data.totals.local && (
              <p style={{ margin: '0.35rem 0 0', fontSize: '1rem', opacity: 0.85 }}>
                Approx. {data.totals.local.formatted}
              </p>
            )}
            <p
              style={{
                margin: '0.85rem 0 0',
                fontSize: '0.71rem',
                opacity: 0.65,
                lineHeight: 1.5,
              }}
            >
              Flight prices from live web search · Living costs researched from
              globalcostdata.com, numbeo.com
            </p>
          </div>

          {/* Section 3 — Line item breakdown */}
          <div style={{ marginBottom: '1.75rem' }}>
            {/* Row 1: Flights */}
            <LineItem
              icon={<Plane size={18} />}
              label="Flights"
              source={data.breakdown.flights.source}
              amount={data.breakdown.flights.amount}
              description={
                <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  Range: {fmtRange(data.breakdown.flights.min, data.breakdown.flights.max)}
                  {data.breakdown.flights.airlines.length > 0 && (
                    <span style={{ color: '#9ca3af' }}>
                      {' · '}
                      {data.breakdown.flights.airlines.slice(0, 3).join(', ')}
                    </span>
                  )}
                </p>
              }
              extra={
                <a
                  href={data.breakdown.flights.googleFlightsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8rem',
                    color: TEAL,
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Check live prices <ExternalLink size={11} />
                </a>
              }
            />

            {/* Row 2: Housing Deposit */}
            <LineItem
              icon={<Home size={18} />}
              label="Housing Deposit"
              source="fallback"
              amount={data.breakdown.housingDeposit.amount}
              description={
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                  {data.breakdown.housingDeposit.note}
                </p>
              }
            />

            {/* Row 3: Temporary Accommodation */}
            <LineItem
              icon={<Building2 size={18} />}
              label="Temporary Accommodation"
              source="fallback"
              amount={data.breakdown.temporaryAccommodation.amount}
              description={
                <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  {data.breakdown.temporaryAccommodation.nights} nights while settling in
                  {' · '}
                  {fmt(data.breakdown.temporaryAccommodation.perNight)}/night
                </p>
              }
              extra={
                <a
                  href={data.breakdown.temporaryAccommodation.bookingComUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8rem',
                    color: TEAL,
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Browse options <ExternalLink size={11} />
                </a>
              }
            />

            {/* Row 4: Document Fees */}
            <LineItem
              icon={<FileText size={18} />}
              label="Document Fees"
              source="fallback"
              amount={data.breakdown.documentFees.amount}
              description={
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                  Skills certificate, police certificate, notarization
                </p>
              }
            />

            {/* Row 5: Shipping */}
            <LineItem
              icon={<Package size={18} />}
              label="Shipping & Moving"
              source="fallback"
              amount={data.breakdown.shipping.amount}
              description={
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                  {data.breakdown.shipping.note}
                </p>
              }
            />

            {/* Row 6: First Month Living (expandable) */}
            <LineItem
              icon={<ShoppingCart size={18} />}
              label="First Month Living"
              source={liveSource}
              amount={data.breakdown.firstMonthLiving.amount}
              description={
                <p style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', color: '#6b7280' }}>
                  Rent, groceries, transport, and utilities
                </p>
              }
              extra={
                <>
                  <button
                    onClick={() => setExpandedLiving((v) => !v)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: TEAL,
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      fontFamily: 'inherit',
                    }}
                  >
                    {expandedLiving ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {expandedLiving ? 'Hide' : 'Show'} breakdown
                  </button>
                  {expandedLiving && (
                    <div
                      style={{
                        marginTop: '0.6rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.25rem 1rem',
                        fontSize: '0.8rem',
                        color: '#4b5563',
                      }}
                    >
                      <span>
                        Rent:{' '}
                        <strong>{fmt(data.breakdown.firstMonthLiving.breakdown.rent)}</strong>
                      </span>
                      <span>
                        Groceries:{' '}
                        <strong>
                          {fmt(data.breakdown.firstMonthLiving.breakdown.groceries)}
                        </strong>
                      </span>
                      <span>
                        Transport:{' '}
                        <strong>
                          {fmt(data.breakdown.firstMonthLiving.breakdown.transport)}
                        </strong>
                      </span>
                      <span>
                        Utilities:{' '}
                        <strong>
                          {fmt(data.breakdown.firstMonthLiving.breakdown.utilities)}
                        </strong>
                      </span>
                    </div>
                  )}
                </>
              }
            />

            {/* Row 7: Emergency Buffer */}
            <LineItem
              icon={<Shield size={18} />}
              label="Emergency Buffer"
              source="fallback"
              amount={data.breakdown.emergencyBuffer.amount}
              isLast
              description={
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                  {data.breakdown.emergencyBuffer.months} months expenses recommended
                </p>
              }
            />
          </div>

          {/* Section 4 — Bar chart */}
          <div style={{ marginBottom: '1.75rem' }}>
            <p
              style={{
                margin: '0 0 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              Cost breakdown by category
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
              >
                <XAxis
                  type="number"
                  fontSize={11}
                  tick={{ fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={118}
                  fontSize={11.5}
                  tick={{ fill: '#4b5563' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [
                    `$${Math.round(Number(value)).toLocaleString()} USD`,
                    'Amount',
                  ]}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="amount" fill={TEAL} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Section 5 — Savings tip */}
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #f59e0b',
              borderRadius: '0.75rem',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
            }}
          >
            <p
              style={{
                margin: '0 0 0.4rem',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#78350f',
              }}
            >
              💡 Money-saving tip
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#78350f',
                lineHeight: 1.65,
              }}
            >
              {data.savingsTip}
            </p>
          </div>

          {/* Section 6 — Disclaimer */}
          <p
            style={{
              margin: 0,
              fontSize: '0.73rem',
              color: '#9ca3af',
              lineHeight: 1.55,
            }}
          >
            {data.disclaimer}
          </p>
        </>
      )}
    </div>
  )
}
