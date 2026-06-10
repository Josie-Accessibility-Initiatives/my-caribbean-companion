import { COUNTRY_META } from '@/data/countryMeta'

export function toCountryCode(nameOrCode: string): string | null {
  const trimmed = nameOrCode.trim()
  const up = trimmed.toUpperCase()
  if (COUNTRY_META[up]) return up
  const entry = Object.entries(COUNTRY_META).find(
    ([, meta]) => meta.name.toLowerCase() === trimmed.toLowerCase()
  )
  return entry?.[0] ?? null
}
