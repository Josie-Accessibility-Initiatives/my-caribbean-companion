'use client'

import type { Neighborhood } from '@/lib/types/housing'

interface NeighborhoodGuideProps {
  neighborhoods: Neighborhood[]
  countryName: string
}

const PRICE_BADGE: Record<
  Neighborhood['priceRange'],
  { label: string; bg: string; color: string }
> = {
  budget:    { label: 'Budget-friendly', bg: '#dcfce7', color: '#166534' },
  mid:       { label: 'Mid-range',       bg: '#dbeafe', color: '#1e40af' },
  'mid-high':{ label: 'Mid-high',        bg: '#fef3c7', color: '#92400e' },
  high:      { label: 'Premium',         bg: '#ffe4e6', color: '#9f1239' },
}

export default function NeighborhoodGuide({
  neighborhoods,
  countryName,
}: NeighborhoodGuideProps) {
  if (neighborhoods.length === 0) return null

  return (
    <div>
      <h2
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 0.85rem',
        }}
      >
        Neighborhoods in {countryName}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {neighborhoods.map((n) => {
          const badge = PRICE_BADGE[n.priceRange]
          return (
            <div
              key={n.name}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1rem 1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#111827',
                  }}
                >
                  {n.name}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '999px',
                    background: badge.bg,
                    color: badge.color,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {badge.label}
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: '0.83rem',
                  color: '#6b7280',
                  lineHeight: 1.45,
                }}
              >
                {n.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
