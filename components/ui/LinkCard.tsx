import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'

type PillVariant = 'facebook' | 'solid'

/** Rounded external link button ("Visit ↗", "Join Group ↗"). */
export function PillLink({
  href,
  children,
  variant,
  icon = true,
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: PillVariant
  icon?: boolean
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`pill-link${variant ? ` pill-link--${variant}` : ''}${className ? ` ${className}` : ''}`}
    >
      {children} {icon && <ExternalLink size={11} />}
    </a>
  )
}

/** Card row with a title, one-line description and an external link on the right. */
export function LinkCard({
  title,
  description,
  href,
  actionLabel = 'Visit',
  variant,
  leading,
  meta,
}: {
  title: ReactNode
  description?: ReactNode
  href: string
  actionLabel?: string
  variant?: PillVariant
  /** Optional icon tile shown before the text. */
  leading?: ReactNode
  /** Optional element shown next to the title (e.g. a badge). */
  meta?: ReactNode
}) {
  return (
    <div className="link-card">
      <div className="link-card-body">
        {leading && <span className="link-card-icon">{leading}</span>}
        <div className="flex-1">
          <div className="row">
            <span className="link-card-title">{title}</span>
            {meta}
          </div>
          {description && <div className="link-card-desc truncate">{description}</div>}
        </div>
      </div>
      <PillLink href={href} variant={variant}>
        {actionLabel}
      </PillLink>
    </div>
  )
}
