'use client'

import { Badge, type BadgeColors } from '@/components/ui/Badge'
import type { Neighborhood } from '@/lib/types/housing'

interface NeighborhoodGuideProps {
  neighborhoods: Neighborhood[]
  countryName: string
}

const PRICE_BADGE: Record<Neighborhood['priceRange'], BadgeColors & { label: string }> = {
  budget:     { label: 'Budget-friendly', bg: '#dcfce7', color: '#166534' },
  mid:        { label: 'Mid-range',       bg: '#dbeafe', color: '#1e40af' },
  'mid-high': { label: 'Mid-high',        bg: '#fef3c7', color: '#92400e' },
  high:       { label: 'Premium',         bg: '#ffe4e6', color: '#9f1239' },
}

export default function NeighborhoodGuide({ neighborhoods, countryName }: NeighborhoodGuideProps) {
  if (neighborhoods.length === 0) return null

  return (
    <div>
      <h2 className="card-heading">Neighborhoods in {countryName}</h2>
      <div className="neighborhood-grid">
        {neighborhoods.map((n) => {
          const badge = PRICE_BADGE[n.priceRange]
          return (
            <div key={n.name} className="neighborhood-card">
              <div className="row-between row-between--top">
                <span className="neighborhood-card-name">{n.name}</span>
                <Badge size="sm" colors={badge}>{badge.label}</Badge>
              </div>
              <p>{n.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
