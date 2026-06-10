export function ErrorCard({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div
      style={{
        background: '#fff7ed',
        border: '1px solid #fed7aa',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        textAlign: 'center',
      }}
    >
      <p style={{ color: '#92400e', fontWeight: 600, margin: onRetry ? '0 0 0.75rem' : 0 }}>
        {message}
      </p>
      {onRetry && (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
