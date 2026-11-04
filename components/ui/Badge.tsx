import type { ReactNode } from 'react'

export type BadgeColors = { bg: string; color: string }

/** Small rounded label. Pass `colors` for category-specific palettes. */
export function Badge({
  children,
  colors,
  size,
  className = '',
}: {
  children: ReactNode
  colors?: BadgeColors
  size?: 'sm'
  className?: string
}) {
  return (
    <span
      className={`badge${size ? ` badge--${size}` : ''}${className ? ` ${className}` : ''}`}
      style={colors ? { background: colors.bg, color: colors.color } : undefined}
    >
      {children}
    </span>
  )
}

/** "Live data" / "Estimated" indicator for figures from web search vs fallback. */
export function SourceBadge({
  live,
  liveLabel = 'Live',
  fallbackLabel = 'Estimated',
  size,
}: {
  live: boolean
  liveLabel?: string
  fallbackLabel?: string
  size?: 'sm'
}) {
  return (
    <Badge size={size} className={live ? 'badge--live' : 'badge--estimated'}>
      <span className="dot" />
      {live ? liveLabel : fallbackLabel}
    </Badge>
  )
}
