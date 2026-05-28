'use client'

import { useRouter, usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'

export default function AICompanionBubble() {
  const router = useRouter()
  const pathname = usePathname()

  if (pathname === '/companion') return null

  return (
    <button
      type="button"
      className="ai-companion-bubble"
      onClick={() => router.push('/companion')}
      aria-label="Open AI Companion"
      title="AI Companion"
    >
      <span className="ai-companion-bubble-tooltip">AI Companion</span>
      <MessageCircle size={24} color="#ffffff" />
    </button>
  )
}
