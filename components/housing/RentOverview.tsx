'use client'

import { BedDouble } from 'lucide-react'

interface RentRange {
  min: number
  max: number
}

interface RentOverviewProps {
  averageRent: {
    studio?: RentRange
    oneBed: RentRange
    twoBed: RentRange
  }
  currency?: string
  note?: string
  source: 'tavily' | 'fallback'
  countryName: string
}

function fmtRange(range: RentRange, currency: string): string {
  return `$${range.min.toLocaleString()} – $${range.max.toLocaleString()} ${currency}/month`
}

export default function RentOverview({
  averageRent,
  currency = 'USD',
  note,
  source,
  countryName,
}: RentOverviewProps) {
  const isLive = source === 'tavily'

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderLeft: '4px solid #117F74',
        borderRadius: '0.75rem',
        padding: '1.25rem 1.5rem',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>
          Average Monthly Rent in {countryName}
        </h2>

        {/* Source badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            background: isLive ? '#dcfce7' : '#f3f4f6',
            color: isLive ? '#166534' : '#6b7280',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: isLive ? '#16a34a' : '#9ca3af',
              display: 'inline-block',
            }}
          />
          {isLive ? 'Live data' : 'Estimated'}
        </span>
      </div>

      {/* Rent rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {averageRent.studio && (
          <RentRow
            label="Studio"
            range={averageRent.studio}
            currency={currency}
            featured={false}
          />
        )}
        <RentRow
          label="1 Bedroom"
          range={averageRent.oneBed}
          currency={currency}
          featured
        />
        <RentRow
          label="2 Bedroom"
          range={averageRent.twoBed}
          currency={currency}
          featured={false}
        />
      </div>

      {/* Note */}
      {note && (
        <p
          style={{
            margin: '0.85rem 0 0',
            fontSize: '0.78rem',
            color: '#9ca3af',
          }}
        >
          {note}
        </p>
      )}

      {/* Disclaimer */}
      <p
        style={{
          margin: '0.6rem 0 0',
          fontSize: '0.75rem',
          color: '#9ca3af',
          fontStyle: 'italic',
        }}
      >
        Prices are estimates. Verify current rates with local agents.
      </p>
    </div>
  )
}

function RentRow({
  label,
  range,
  currency,
  featured,
}: {
  label: string
  range: RentRange
  currency: string
  featured: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        padding: featured ? '0.6rem 0.75rem' : '0.35rem 0.75rem',
        borderRadius: '0.5rem',
        background: featured ? 'rgba(17,127,116,0.06)' : 'transparent',
        border: featured ? '1px solid rgba(17,127,116,0.15)' : '1px solid transparent',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.875rem',
          fontWeight: featured ? 600 : 400,
          color: featured ? '#111827' : '#4b5563',
        }}
      >
        <BedDouble size={15} color={featured ? '#117F74' : '#9ca3af'} />
        {label}
      </span>
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: featured ? 700 : 500,
          color: featured ? '#111827' : '#6b7280',
          whiteSpace: 'nowrap',
        }}
      >
        {fmtRange(range, currency)}
      </span>
    </div>
  )
}
