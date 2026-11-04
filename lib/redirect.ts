/**
 * Only allow same-site relative paths from `?redirect=` / `?next=` params, so a
 * crafted link can't send users to another site after logging in (open redirect).
 */
export function safeRedirectPath(value: string | null | undefined, fallback = '/dashboard'): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}
