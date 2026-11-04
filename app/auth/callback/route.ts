import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { safeRedirectPath } from '@/lib/redirect'

/**
 * Landing route for Supabase email links (password reset, email confirmation).
 * Exchanges the link's one-time code for a session cookie, then redirects to
 * `next`. Supports both the PKCE `?code=` link and the `?token_hash=` template.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = safeRedirectPath(searchParams.get('next'))
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const supabase = await createClient()
  let error: unknown = new Error('Missing code')

  if (code) {
    ;({ error } = await supabase.auth.exchangeCodeForSession(code))
  } else if (tokenHash && type) {
    ;({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }))
  }

  if (!error) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  console.error('GET /auth/callback:', error)
  // An expired or already-used link: send password resets back to request a new one.
  const failure = next === '/reset-password' ? '/forgot-password?error=link_expired' : '/login'
  return NextResponse.redirect(`${origin}${failure}`)
}
