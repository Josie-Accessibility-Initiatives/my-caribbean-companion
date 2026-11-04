import type { ReactNode } from 'react'
import { SourceBadge } from '@/components/ui/Badge'
import { fmt } from '@/lib/format'
import type { DataSource } from '@/lib/types/cost'

export type CostLineItemProps = {
  icon: ReactNode
  label: string
  amount: number
  source: DataSource
  description: ReactNode
  extra?: ReactNode
}

/** One row of the relocation cost breakdown. */
export default function CostLineItem({
  icon,
  label,
  amount,
  source,
  description,
  extra,
}: CostLineItemProps) {
  return (
    <div className="ce-line">
      <div className="ce-line-icon">{icon}</div>
      <div className="flex-1">
        <div className="row ce-line-head">
          <span className="ce-line-label">{label}</span>
          <SourceBadge live={source === 'tavily'} size="sm" />
        </div>
        <p className="ce-line-desc">{description}</p>
        {extra}
      </div>
      <span className="ce-line-amount">{fmt(amount)}</span>
    </div>
  )
}
