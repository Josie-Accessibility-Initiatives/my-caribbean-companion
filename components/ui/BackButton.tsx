'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
}

export default function BackButton({ href, label = 'Back' }: BackButtonProps) {
  const router = useRouter()

  if (href) {
    return (
      <Link href={href} className="back-button">
        ← {label}
      </Link>
    )
  }

  return (
    <button type="button" onClick={() => router.back()} className="back-button">
      ← {label}
    </button>
  )
}
