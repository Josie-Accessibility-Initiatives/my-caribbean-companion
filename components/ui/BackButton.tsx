'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
}

const STYLE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  marginBottom: '1rem',
  padding: '0.375rem 0.75rem',
  background: 'none',
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  color: '#6b7280',
  fontWeight: 500,
  textDecoration: 'none',
  cursor: 'pointer',
}

export default function BackButton({ href, label = 'Back' }: BackButtonProps) {
  const router = useRouter()

  if (href) {
    return (
      <Link href={href} style={STYLE}>
        ← {label}
      </Link>
    )
  }

  return (
    <button onClick={() => router.back()} style={STYLE}>
      ← {label}
    </button>
  )
}
