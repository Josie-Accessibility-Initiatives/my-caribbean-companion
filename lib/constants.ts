import countriesData from '@/data/countries.json'
import categoriesData from '@/data/categories.json'
import type { Category, Country } from '@/lib/types/csme'

// ── Reference data (static JSON, safe for client and server) ──────

/** All 12 CARICOM countries, alphabetical by name. */
export const COUNTRIES: Country[] = (countriesData as Country[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name))

/** CSME skill categories, alphabetical by label. */
export const CATEGORIES: Category[] = (categoriesData as Category[])
  .slice()
  .sort((a, b) => a.label.localeCompare(b.label))

/** Lightweight { code, name } list for country dropdowns. */
export const SORTED_COUNTRIES = COUNTRIES.map(({ code, name }) => ({ code, name }))

export function countryName(code: string | null | undefined): string {
  if (!code) return ''
  return COUNTRIES.find((c) => c.code === code)?.name ?? code
}

/** Accepts a category code or numeric id. */
export function categoryLabel(code: string | null | undefined): string {
  if (!code) return ''
  return CATEGORIES.find((c) => c.code === code || String(c.id) === code)?.label ?? code
}

/** Display order used on the comparison page. */
export const COUNTRY_ORDER = [
  'TT', 'BB', 'JM', 'GY', 'LC', 'GD',
  'DM', 'VC', 'KN', 'AG', 'SR', 'BZ',
]

// ── External API identifiers ──────────────────────────────────────

/** Full country names as expected by CaribGov and JSearch. */
export const OFFICIAL_COUNTRY_NAMES: Record<string, string> = {
  TT: 'Trinidad and Tobago',
  BB: 'Barbados',
  JM: 'Jamaica',
  GY: 'Guyana',
  LC: 'Saint Lucia',
  GD: 'Grenada',
  DM: 'Dominica',
  VC: 'Saint Vincent and the Grenadines',
  KN: 'Saint Kitts and Nevis',
  AG: 'Antigua and Barbuda',
  SR: 'Suriname',
  BZ: 'Belize',
}

/** ISO 3166 alpha-3 codes (World Bank, REST Countries). */
export const ISO3_CODES: Record<string, string> = {
  TT: 'TTO', BB: 'BRB', JM: 'JAM', GY: 'GUY',
  LC: 'LCA', GD: 'GRD', DM: 'DMA', VC: 'VCT',
  KN: 'KNA', AG: 'ATG', SR: 'SUR', BZ: 'BLZ',
}
