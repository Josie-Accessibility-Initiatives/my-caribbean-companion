import { COUNTRY_META } from '@/data/countryMeta'

export const SORTED_COUNTRIES = Object.entries(COUNTRY_META)
  .map(([code, meta]) => ({ code, name: meta.name }))
  .sort((a, b) => a.name.localeCompare(b.name))
