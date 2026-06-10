const PULSE = 'pulse 1.5s ease-in-out infinite'

export function SkeletonCard() {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '0.375rem', background: '#e5e7eb', animation: PULSE }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ height: 14, width: '55%', borderRadius: 4, background: '#e5e7eb', animation: PULSE }} />
          <div style={{ height: 11, width: '35%', borderRadius: 4, background: '#f3f4f6', animation: PULSE }} />
        </div>
      </div>
      <div style={{ height: 11, width: '70%', borderRadius: 4, background: '#f3f4f6', animation: PULSE }} />
      <div style={{ height: 11, width: '90%', borderRadius: 4, background: '#f3f4f6', animation: PULSE }} />
      <div style={{ height: 11, width: '60%', borderRadius: 4, background: '#f3f4f6', animation: PULSE }} />
    </div>
  )
}

export function SkeletonBlock({ height = 120 }: { height?: number }) {
  return (
    <div
      style={{
        borderRadius: '0.75rem',
        background: '#e5e7eb',
        height,
        animation: PULSE,
      }}
    />
  )
}

export function TableSkeleton() {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 12,
            padding: '11px 16px',
            borderBottom: i < 6 ? '1px solid #f1f5f9' : 'none',
          }}
        >
          <div
            style={{
              width: 120,
              height: 16,
              borderRadius: 4,
              background: '#e5e7eb',
              flexShrink: 0,
              animation: 'cp-shimmer 1.4s ease-in-out infinite',
            }}
          />
          {Array.from({ length: 7 }).map((_, j) => (
            <div
              key={j}
              style={{
                flex: 1,
                height: 16,
                borderRadius: 4,
                background: '#e5e7eb',
                animation: 'cp-shimmer 1.4s ease-in-out infinite',
                animationDelay: `${j * 0.05}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
