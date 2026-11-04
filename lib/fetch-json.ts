/**
 * fetch() + JSON parse for our own API routes. Throws an Error carrying the
 * route's `{ error }` message (or `fallbackError`) when the response is not ok.
 */
export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  fallbackError = 'Request failed'
): Promise<T> {
  const res = await fetch(url, init)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const message = (body as { error?: string } | null)?.error
    throw new Error(message || fallbackError)
  }
  return body as T
}

/** POST a JSON body to one of our API routes. */
export function postJson<T>(url: string, data: unknown, fallbackError?: string): Promise<T> {
  return fetchJson<T>(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    },
    fallbackError
  )
}

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}
