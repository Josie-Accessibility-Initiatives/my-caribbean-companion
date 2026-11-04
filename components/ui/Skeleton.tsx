import type { CSSProperties } from 'react'

/** Grey pulsing placeholder block. */
export function Skeleton({
  width,
  height = 14,
  radius,
  light,
  style,
}: {
  width?: number | string
  height?: number | string
  radius?: number | string
  light?: boolean
  style?: CSSProperties
}) {
  return (
    <div
      className={`skeleton${light ? ' skeleton--light' : ''}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-row">
        <Skeleton width={40} height={40} />
        <div className="skeleton-lines">
          <Skeleton width="55%" height={14} radius={4} />
          <Skeleton width="35%" height={11} radius={4} light />
        </div>
      </div>
      {['70%', '90%', '60%'].map((w) => (
        <Skeleton key={w} width={w} height={11} radius={4} light />
      ))}
    </div>
  )
}

export function SkeletonBlock({ height = 120 }: { height?: number }) {
  return <Skeleton height={height} radius="0.75rem" />
}

export function TableSkeleton() {
  return (
    <div className="ct-skeleton">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="ct-skel-row">
          <div className="ct-skel-cell ct-skel-flag" />
          {Array.from({ length: 7 }).map((_, j) => (
            <div key={j} className="ct-skel-cell" style={{ animationDelay: `${j * 0.05}s` }} />
          ))}
        </div>
      ))}
    </div>
  )
}
