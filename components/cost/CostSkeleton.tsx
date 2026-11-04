import { Skeleton } from '@/components/ui/Skeleton'

const ROWS = 7

/** Placeholder matching the cost estimator layout while it loads. */
export default function CostSkeleton() {
  return (
    <>
      <Skeleton height={144} radius="0.75rem" style={{ marginBottom: '1.5rem' }} />
      {Array.from({ length: ROWS }).map((_, i) => (
        <div key={i} className="ce-line">
          <Skeleton width={20} height={20} radius="50%" />
          <div className="skeleton-lines">
            <Skeleton width="42%" height={14} />
            <Skeleton width="62%" height={12} />
          </div>
          <Skeleton width={68} height={18} radius="0.25rem" />
        </div>
      ))}
      <Skeleton height={300} radius="0.75rem" style={{ margin: '1.5rem 0' }} />
      <Skeleton height={82} radius="0.75rem" />
    </>
  )
}
