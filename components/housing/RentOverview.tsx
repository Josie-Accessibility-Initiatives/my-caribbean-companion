'use client'

import { BedDouble } from 'lucide-react'
import { SourceBadge } from '@/components/ui/Badge'
import { fmtRentRange } from '@/lib/format'
import type { RentRange } from '@/lib/types/housing'

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

function RentRow({
  label,
  range,
  currency,
  featured = false,
}: {
  label: string
  range: RentRange
  currency: string
  featured?: boolean
}) {
  return (
    <div className={`rent-row${featured ? ' rent-row--featured' : ''}`}>
      <span className="rent-row-label">
        <BedDouble size={15} />
        {label}
      </span>
      <span className="rent-row-value">{fmtRentRange(range, currency)}</span>
    </div>
  )
}

export default function RentOverview({
  averageRent,
  currency = 'USD',
  note,
  source,
  countryName,
}: RentOverviewProps) {
  return (
    <div className="card card--accent">
      <div className="row-between row-between--top mb-1">
        <h2 className="card-heading no-margin">Average Monthly Rent in {countryName}</h2>
        <SourceBadge live={source === 'tavily'} liveLabel="Live data" />
      </div>

      <div className="stack-sm">
        {averageRent.studio && (
          <RentRow label="Studio" range={averageRent.studio} currency={currency} />
        )}
        <RentRow label="1 Bedroom" range={averageRent.oneBed} currency={currency} featured />
        <RentRow label="2 Bedroom" range={averageRent.twoBed} currency={currency} />
      </div>

      {note && <p className="fine-print mt-1">{note}</p>}
      <p className="fine-print fine-print--note">
        Prices are estimates. Verify current rates with local agents.
      </p>
    </div>
  )
}
